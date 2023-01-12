import React from 'react';
import { useSelector } from 'react-redux';

import { selectors } from '../../../../../../data/redux';
import * as hooks from './hooks';
import messages from '../messages';

jest.mock('react', () => {
  const updateState = jest.fn();
  const dispatchFn = jest.fn();
  return {
    ...jest.requireActual('react'),
    updateState,
    useState: jest.fn(val => ([{ state: val }, (newVal) => updateState({ val, newVal })])),
    useCallback: (cb, prereqs) => ({ useCallback: { cb, prereqs } }),
    useEffect: jest.fn(),
    useSelector: jest.fn(),
    dispatch: dispatchFn,
    useDispatch: jest.fn(() => dispatchFn),
  };
});

jest.mock('../../../../../../data/redux', () => ({
  actions: {
    video: {
      updateField: (val) => ({ updateField: val }),
    },
  },
  selectors: {
    video: {
      duration: (state) => ({ duration: state }),
    },
  },
}));

let hook;
const dispatch = jest.fn(val => ({ dispatch: val }));
const intl = {
  formatMessage: jest.fn(val => val),
};

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
  ['99:99:99', 99 * (m + s + h)],
  ['23:42:81', 23 * h + 42 * m + 81 * s],
];
let props;
const e = {
  target: {
    value: 'vAlUE',
  },
};

describe('Video Settings DurationWidget hooks', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });
  describe('durationWidget', () => {
    let reduxStartStopTimes;
    beforeEach(() => {
      hook = hooks.durationWidget({ dispatch });
      reduxStartStopTimes = useSelector(selectors.video.duration);
    });
    describe('behavior', () => {
      describe('initialization', () => {
        test('useEffect memoized on reduxStartStopTimes', () => {
          hooks.durationWidget({ dispatch });
          expect(React.useEffect).toHaveBeenCalled();
          expect(React.useEffect.mock.calls[0][1]).toEqual([reduxStartStopTimes]);
        });
        test('calls setUnsavedStartStopTimes with durationString(reduxStartStopTimes)', () => {
          hooks.durationWidget({ dispatch });
          React.useEffect.mock.calls[0][0]();
          expect(React.updateState).toHaveBeenCalled();
        });
      });
    });
    describe('returns', () => {
      hook = hooks.durationWidget({ dispatch });
      afterEach(() => {
        jest.restoreAllMocks();
      });
      describe('reduxStartStopTimes, with redux duration value', () => {
        expect(hook.reduxStartStopTimes).toEqual(useSelector(selectors.video.duration));
      });
      describe('unsavedStartStopTimes, defaulted to reduxStartStopTimes', () => {
        expect(hook.unsavedStartStopTimes).toEqual({ state: hooks.durationString(hook.reduxStartStopTimes) });
      });
      describe('onBlur, calls updateDuration', () => {
        jest.spyOn(hooks, 'updateDuration').mockImplementation(jest.fn());
        hook.onBlur('IndEX')(e);
        expect(hooks.updateDuration).toHaveBeenCalled();
      });
      describe('onChange', () => {
        hook.onChange('IndEX')(e);
        expect(React.updateState).toHaveBeenCalled();
      });
      describe('onKeyDown', () => {
        hook.onKeyDown('iNDex')(e);
        expect(React.updateState).toHaveBeenCalled();
      });
      describe('getTotalLabel', () => {
        describe('returns fullVideoLength message when no startTime and no stop Time are set', () => {
          expect(hook.getTotalLabel({
            duration: {},
            subtitle: true,
            intl,
          })).toEqual(messages.fullVideoLength);
        });
        describe('returns startAt message for subtitle when only startTime is set', () => {
          expect(hook.getTotalLabel({
            duration: {
              startTime: '00:00:00',
            },
            subtitle: true,
            intl,
          })).toEqual(messages.startsAt);
        });
        describe('returns null for widget (not subtitle) when there only startTime is set', () => {
          expect(hook.getTotalLabel({
            duration: {
              startTime: '00:00:00',
            },
            subtitle: false,
            intl,
          })).toEqual(null);
        });
        describe('returns total message when at least stopTime is set', () => {
          expect(hook.getTotalLabel({
            duration: {
              startTime: '00:00:00',
              stopTime: '00:00:10',
            },
            subtitle: true,
            intl,
          })).toEqual(messages.total);
        });
      });
    });
  });
  describe('durationString', () => {
    beforeEach(() => {
      hook = hooks.durationString;
    });
    it('returns an object that maps durationStringFromValue to the passed duration keys', () => {
      const testDuration = { startTime: 1000, stopTime: 2000, other: 'values' };
      expect(hook(testDuration)).toEqual({
        startTime: '00:00:01',
        stopTime: '00:00:02',
      });
    });
  });
  describe('durationStringFromValue', () => {
    beforeEach(() => {
      hook = hooks.durationStringFromValue;
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
  describe('updateDuration', () => {
    const testValidIndex = 'startTime';
    const testStopIndex = 'stopTime';
    const testValidDuration = '00:00:00';
    const testValidValue = 0;
    const testInvalidDuration = 'abc';
    beforeEach(() => {
      hook = hooks.updateDuration;
      props = {
        reduxStartStopTimes: { startTime: 23000, stopTime: 600000 },
        unsavedStartStopTimes: { startTime: '00:00:23', stopTime: '00:10:00' },
        setReduxStartStopTimes: jest.fn(),
        setUnsavedStartStopTimes: jest.fn(),
        index: 'startTime',
        inputString: '01:23:45',
      };
    });
    describe('if the passed durationString is valid', () => {
      it('sets the unsavedStartStopTimes to updated strings and reduxStartStopTimes to new timestamp value', () => {
        hook({
          ...props,
          index: testValidIndex,
          inputString: testValidDuration,
        });
        expect(props.setUnsavedStartStopTimes).toHaveBeenCalledWith({
          ...props.unsavedStartStopTimes,
          [testValidIndex]: testValidDuration,
        });
        expect(props.setReduxStartStopTimes).toHaveBeenCalledWith({
          ...props.reduxStartStopTimes,
          [testValidIndex]: testValidValue,
        });
      });
    });
    describe('if the passed durationString is not valid', () => {
      it('updates unsavedStartStopTimes values to 0 (the default)', () => {
        hook({
          ...props,
          index: testValidIndex,
          inputString: testInvalidDuration,
        });
        expect(props.setUnsavedStartStopTimes).toHaveBeenCalledWith({
          ...props.unsavedStartStopTimes,
          [testValidIndex]: testValidDuration,
        });
        expect(props.setReduxStartStopTimes).toHaveBeenCalledWith({
          ...props.reduxStartStopTimes,
          [testValidIndex]: testValidValue,
        });
      });
    });
    describe('if the passed startTime is after (or equal to) the stored non-zero stopTime', () => {
      it('updates unsavedStartStopTimes startTime values to 1 second before stopTime', () => {
        hook({
          ...props,
          index: testValidIndex,
          inputString: '00:10:00',
        });
        expect(props.setUnsavedStartStopTimes).toHaveBeenCalledWith({
          ...props.unsavedStartStopTimes,
          [testValidIndex]: '00:09:59',
        });
        expect(props.setReduxStartStopTimes).toHaveBeenCalledWith({
          ...props.reduxStartStopTimes,
          [testValidIndex]: 599000,
        });
      });
    });
    describe('if the passed stopTime is before (or equal to) the stored startTime', () => {
      it('updates unsavedStartStopTimes stopTime values to 1 second after startTime', () => {
        hook({
          ...props,
          index: testStopIndex,
          inputString: '00:00:22',
        });
        expect(props.setUnsavedStartStopTimes).toHaveBeenCalledWith({
          ...props.unsavedStartStopTimes,
          [testStopIndex]: '00:00:24',
        });
        expect(props.setReduxStartStopTimes).toHaveBeenCalledWith({
          ...props.reduxStartStopTimes,
          [testStopIndex]: 24000,
        });
      });
    });
  });
  describe('onDurationChange', () => {
    beforeEach(() => {
      props = {
        duration: { startTime: '00:00:00' },
        index: 'startTime',
        val: 'vAl',
      };
      hook = hooks.onDurationChange;
    });
    it('returns duration with no change if duration[index] does not match HH:MM:SS format', () => {
      const badChecks = [
        'ab:cd:ef', // non-digit characters
        '12:34:567', // characters past max length
      ];
      badChecks.forEach(val => expect(hook(props.duration, props.index, val)).toEqual(props.duration));
    });
    it('returns duration with an added \':\' after 2 characters when caret is at end', () => {
      props.duration = { startTime: '0' };
      props.val = '00';
      document.activeElement.selectionStart = props.duration[props.index].length + 1;
      expect(hook(props.duration, props.index, props.val)).toEqual({ startTime: '00:' });
    });
    it('returns duration with an added \':\' after 5 characters when caret is at end', () => {
      props.duration = { startTime: '00:0' };
      props.val = '00:00';
      document.activeElement.selectionStart = props.duration[props.index].length + 1;
      expect(hook(props.duration, props.index, props.val)).toEqual({ startTime: '00:00:' });
    });
  });
  describe('onDurationKeyDown', () => {
    beforeEach(() => {
      props = {
        duration: { startTime: '00:00:00' },
        index: 'startTime',
        event: 'eVeNt',
      };
      hook = hooks.onDurationKeyDown;
    });
    it('enter event: calls blur()', () => {
      props.event = { key: 'Enter' };
      const blurSpy = jest.spyOn(document.activeElement, 'blur');
      hook(props.duration, props.index, props.event);
      expect(blurSpy).toHaveBeenCalled();
    });
    it('backspace event: returns duration with deleted end character when that character is \':\' and caret is at end', () => {
      props.duration = { startTime: '00:' };
      props.event = { key: 'Backspace' };
      document.activeElement.selectionStart = props.duration[props.index].length;
      expect(hook(props.duration, props.index, props.event)).toEqual({ startTime: '00' });
    });
  });
  describe('valueFromDuration', () => {
    beforeEach(() => {
      hook = hooks.valueFromDuration;
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
});
