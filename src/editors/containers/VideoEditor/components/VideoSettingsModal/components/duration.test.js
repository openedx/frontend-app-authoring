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
    it('translates milliseconds into hh:mm:ss format', () => {
      durationPairs.forEach(
        ([val, dur]) => expect(duration.durationFromValue(val)).toEqual(dur),
      );
    });
  });
  describe('valueFromDuration', () => {
    beforeEach(() => {
      hook = duration.valueFromDuration;
    });
    it('returns null if given a bad duration string', () => {
      const badChecks = ['a', '00:00:1f', '0adg:00:04'];
      badChecks.forEach(dur => expect(hook(dur)).toEqual(null));
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
    const testDuration = 'myDuration';
    const testIndex = 'startTime';
    const mockValueFromDuration = (dur) => ({ value: dur });
    const mockDurationFromValue = (value) => ({ duration: value });
    beforeEach(() => {
      props = {
        formValue: { startTime: 230000, stopTime: 0 },
        local: { startTime: '00:00:23', stopTime: '00:00:00' },
        setLocal: jest.fn(),
        setFormValue: jest.fn(),
      };
      spies.valueFromDuration = jest.spyOn(duration, durationKeys.valueFromDuration)
        .mockImplementation(mockValueFromDuration);
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
          cb(testIndex, testDuration);
          expect(duration.valueFromDuration).toHaveBeenCalledWith(testDuration);
          expect(props.setLocal).toHaveBeenCalledWith({
            ...props.local,
            [testIndex]: testDuration,
          });
          expect(props.setFormValue).toHaveBeenCalledWith({
            ...props.formValue,
            [testIndex]: mockValueFromDuration(testDuration),
          });
        });
      });
      describe('if the passed durationString is not valid', () => {
        it('updates local back to the string for the form-stored timestamp value', () => {
          spies.valueFromDuration.mockReturnValue(null);
          spies.durationFromValue = jest.spyOn(duration, durationKeys.durationFromValue)
            .mockImplementationOnce(mockDurationFromValue);
          hook(props).useCallback.cb(testIndex, testDuration);
          expect(props.setLocal).toHaveBeenCalledWith({
            ...props.local,
            [testIndex]: mockDurationFromValue(props.formValue[testIndex]),
          });
          expect(props.setFormValue).not.toHaveBeenCalled();
        });
      });
    });
  });
});
