import { keyStore } from '../../../../../utils';
import * as duration from './duration';

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useCallback: (cb, prereqs) => ({ useCallback: { cb, prereqs } }),
}));

let hook;
const durationKeys = keyStore(duration);
const [h, m, s] = [3600000, 60000, 1000];
const durationPairs = [
  [0, '00:00:00'],
  [5000, '00:00:05'],
  [60000, '00:01:00'],
  [3600000, '01:00:00'],
  [3665000, '01:01:05'],
];
const trickyDurations = [
  ['10:00', 600000],
  ['23', 23000],
  ['100:100:100', 100 * (m + s + h)],
  ['23:42:781', 23 * h + 42 * m + 781 * s],
];
let spies = {};
let props;
let cb;
let prereqs;
let oldDuration;
describe('Video Settings Modal duration hooks', () => {
  beforeEach(() => {
    spies = {};
    oldDuration = { ...jest.requireActual('./duration') };
  });
  afterEach(() => {
    Object.keys(oldDuration).forEach((key) => {
      duration[key] = oldDuration[key];
    });
    Object.keys(spies).forEach((key) => {
      spies[key].mockRestore();
    });
  });

  describe('durationFromValue', () => {
    beforeEach(() => {
      hook = duration.durationFromValue;
    });
    it('returns 00:00:00 if given a bad value', () => {
      const badChecks = ['a', '', null, -1];
      badChecks.forEach(val => expect(hook(val)).toEqual('00:00:00'));
    });
    it('translates milliseconds into hh:mm:ss format', () => {
      durationPairs.forEach(
        ([val, dur]) => expect(hook(val)).toEqual(dur),
      );
    });
  });
  describe('valueFromDuration', () => {
    beforeEach(() => {
      hook = duration.valueFromDuration;
    });
    it('returns 0 if given a bad duration string', () => {
      const badChecks = ['a', '00:00:1f', '0adg:00:04'];
      badChecks.forEach(dur => expect(hook(dur)).toEqual(0));
    });
    it('returns simple durations', () => {
      durationPairs.forEach(([val, dur]) => expect(hook(dur)).toEqual(val));
    });
    it('returns tricky durations, prepending zeros and expanding out sections', () => {
      trickyDurations.forEach(([dur, val]) => expect(hook(dur)).toEqual(val));
    });
  });
  describe('durationValue', () => {
    const mock = jest.fn(v => ({ duration: v }));
    beforeEach(() => {
      jest.spyOn(duration, durationKeys.durationFromValue).mockImplementation(mock);
    });
    it('returns an object that maps durationFromValue to the passed duration keys', () => {
      const testDuration = { startTime: 1, stopTime: 2, other: 'values' };
      expect(duration.durationValue(testDuration)).toEqual({
        startTime: mock(testDuration.startTime),
        stopTime: mock(testDuration.stopTime),
      });
    });
  });
  describe('updateDuration', () => {
    const testValidIndex = 'startTime';
    const testStopIndex = 'stopTime';
    const testValidDuration = '00:00:00';
    const testValidValue = 0;
    const testInvalidDuration = 'abc';
    beforeEach(() => {
      props = {
        formValue: { startTime: 23000, stopTime: 600000 },
        local: { startTime: '00:00:23', stopTime: '00:10:00' },
        setLocal: jest.fn(),
        setFormValue: jest.fn(),
      };
      hook = duration.updateDuration;
      ({ cb, prereqs } = hook(props).useCallback);
    });
    it('returns a useCallback field based on the passed args', () => {
      expect(prereqs).toEqual([
        props.formValue,
        props.local,
        props.setLocal,
        props.setFormValue,
      ]);
    });
    describe('callback', () => {
      describe('if the passed durationString is valid', () => {
        it('sets the local value to updated strings and form value to new timestamp value', () => {
          cb(testValidIndex, testValidDuration);
          expect(props.setLocal).toHaveBeenCalledWith({
            ...props.local,
            [testValidIndex]: testValidDuration,
          });
          expect(props.setFormValue).toHaveBeenCalledWith({
            ...props.formValue,
            [testValidIndex]: testValidValue,
          });
        });
      });
      describe('if the passed durationString is not valid', () => {
        it('updates local values to 0 (the default)', () => {
          hook(props).useCallback.cb(testValidIndex, testInvalidDuration);
          expect(props.setLocal).toHaveBeenCalledWith({
            ...props.local,
            [testValidIndex]: testValidDuration,
          });
          expect(props.setFormValue).toHaveBeenCalledWith({
            ...props.formValue,
            [testValidIndex]: testValidValue,
          });
        });
      });
      describe('if the passed startTime is after (or equal to) the stored non-zero stopTime', () => {
        it('updates local startTime values to 1 second before stopTime', () => {
          hook(props).useCallback.cb(testValidIndex, '00:10:00');
          expect(props.setLocal).toHaveBeenCalledWith({
            ...props.local,
            [testValidIndex]: '00:09:59',
          });
          expect(props.setFormValue).toHaveBeenCalledWith({
            ...props.formValue,
            [testValidIndex]: 599000,
          });
        });
      });
      describe('if the passed stopTime is before (or equal to) the stored startTime', () => {
        it('updates local stopTime values to 1 second after startTime', () => {
          hook(props).useCallback.cb(testStopIndex, '00:00:22');
          expect(props.setLocal).toHaveBeenCalledWith({
            ...props.local,
            [testStopIndex]: '00:00:24',
          });
          expect(props.setFormValue).toHaveBeenCalledWith({
            ...props.formValue,
            [testStopIndex]: 24000,
          });
        });
      });
    });
  });
});
