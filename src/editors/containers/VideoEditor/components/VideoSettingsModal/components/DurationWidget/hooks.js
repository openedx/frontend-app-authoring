import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import { actions, selectors } from '../../../../../../data/redux';
import messages from '../messages';

import * as module from './hooks';

const durationMatcher = /^(\d{0,2}):?(\d{0,2})?:?(\d{0,2})?$/i;

export const durationWidget = ({ dispatch }) => {
  const reduxStartStopTimes = useSelector(selectors.video.duration);
  const setReduxStartStopTimes = (val) => dispatch(actions.video.updateField({ duration: val }));
  const initialState = module.durationString(reduxStartStopTimes);
  const [unsavedStartStopTimes, setUnsavedStartStopTimes] = useState(initialState);

  useEffect(() => {
    setUnsavedStartStopTimes(module.durationString(reduxStartStopTimes));
  }, [reduxStartStopTimes]);

  return {
    reduxStartStopTimes,
    unsavedStartStopTimes,
    onBlur: (index) => (
      (e) => module.updateDuration({
        reduxStartStopTimes,
        setReduxStartStopTimes,
        unsavedStartStopTimes,
        setUnsavedStartStopTimes,
        index,
        durationString: e.target.value,
      })
    ),
    onChange: (index) => (
      (e) => setUnsavedStartStopTimes(module.onDurationChange(unsavedStartStopTimes, index, e.target.value))
    ),
    onKeyDown: (index) => (
      (e) => setUnsavedStartStopTimes(module.onDurationKeyDown(unsavedStartStopTimes, index, e))
    ),
    getTotalLabel: ({ duration, subtitle, intl }) => {
      if (!duration.stopTime) {
        if (!duration.startTime) {
          return intl.formatMessage(messages.fullVideoLength);
        }
        if (subtitle) {
          return intl.formatMessage(
            messages.startsAt,
            { startTime: module.durationStringFromValue(duration.startTime) },
          );
        }
        return null;
      }
      const total = duration.stopTime - (duration.startTime || 0);
      return intl.formatMessage(messages.total, { total: module.durationStringFromValue(total) });
    },
  };
};

/**
 * durationString(duration)
 * Returns the display value for embedded start and stop times
 * @param {object} duration - object containing startTime and stopTime millisecond values
 * @return {object} - start and stop time from incoming object mapped to duration strings.
 */
export const durationString = (duration) => ({
  startTime: module.durationStringFromValue(duration.startTime),
  stopTime: module.durationStringFromValue(duration.stopTime),
});

/**
 * durationStringFromValue(value)
 * Returns a duration string in 'hh:mm:ss' format from the given ms value
 * @param {number} value - duration (in milliseconds)
 * @return {string} - duration in 'hh:mm:ss' format
 */
export const durationStringFromValue = (value) => {
  // return 'why';
  if (!value || typeof value !== 'number' || value <= 0) {
    return '00:00:00';
  }
  const seconds = Math.floor((value / 1000) % 60);
  const minutes = Math.floor((value / 60000) % 60);
  const hours = Math.floor((value / 3600000) % 60);
  const zeroPad = (num) => String(num).padStart(2, '0');
  return [hours, minutes, seconds].map(zeroPad).join(':');
};

/**
 * updateDuration({ reduxStartStopTimes, unsavedStartStopTimes, setUnsavedStartStopTimes, setReduxStartStopTimes })
 * Returns a memoized callback based on inputs that updates unsavedStartStopTimes value and form value
 * if the new string is valid (reduxStartStopTimes stores a number, unsavedStartStopTimes stores a string).
 * If the duration string is invalid, resets the unsavedStartStopTimes value to the latest good value.
 * @param {object} reduxStartStopTimes - redux-stored durations in milliseconds
 * @param {object} unsavedStartStopTimes - hook-stored duration in 'hh:mm:ss' format
 * @param {func} setReduxStartStopTimes - set form value
 * @param {func} setUnsavedStartStopTimes - set unsavedStartStopTimes object
 * @param {string} index - startTime or stopTime
 * @return {func} - callback to update duration unsavedStartStopTimesly and in redux
 *   updateDuration(args)(index, durationString)
 */
export const updateDuration = ({
  reduxStartStopTimes,
  unsavedStartStopTimes,
  setReduxStartStopTimes,
  setUnsavedStartStopTimes,
  index,
  inputString,
}) => {
  let newDurationString = inputString;
  let newValue = module.valueFromDuration(newDurationString);
  // maxTime is 23:59:59 or 86399 seconds
  if (newValue > 86399000) {
    newValue = 86399000;
  }
  // stopTime must be at least 1 second, if not zero
  if (index === 'stopTime' && newValue > 0 && newValue < 1000) {
    newValue = 1000;
  }
  // stopTime must be at least 1 second after startTime, except 0 means no custom stopTime
  if (index === 'stopTime' && newValue > 0 && newValue < (reduxStartStopTimes.startTime + 1000)) {
    newValue = reduxStartStopTimes.startTime + 1000;
  }
  // startTime must be at least 1 second before stopTime, except when stopTime is less than a second
  // (stopTime should only be less than a second if it's zero, but we're being paranoid)
  if (index === 'startTime' && reduxStartStopTimes.stopTime >= 1000 && newValue > (reduxStartStopTimes.stopTime - 1000)) {
    newValue = reduxStartStopTimes.stopTime - 1000;
  }
  newDurationString = module.durationStringFromValue(newValue);
  setUnsavedStartStopTimes({ ...unsavedStartStopTimes, [index]: newDurationString });
  setReduxStartStopTimes({ ...reduxStartStopTimes, [index]: newValue });
};

/**
 * onDurationChange(duration)
 * Returns a new duration value based on onChange event
 * @param {object} duration - object containing startTime and stopTime millisecond values
 * @param {string} index - 'startTime or 'stopTime'
 * @param {string} val - duration in 'hh:mm:ss' format
 * @return {object} duration - object containing startTime and stopTime millisecond values
 */
export const onDurationChange = (duration, index, val) => {
  const match = val.trim().match(durationMatcher);
  if (!match) {
    return duration;
  }

  const caretPos = document.activeElement.selectionStart;
  let newDuration = val;
  if (caretPos === newDuration.length && (newDuration.length === 2 || newDuration.length === 5)) {
    newDuration += ':';
  }

  return {
    ...duration,
    [index]: newDuration,
  };
};

/**
 * onDurationKeyDown(duration)
 * Returns a new duration value based on onKeyDown event
 * @param {object} duration - object containing startTime and stopTime millisecond values
 * @param {string} index - 'startTime or 'stopTime'
 * @param {Event} event - event from onKeyDown
 * @return {object} duration - object containing startTime and stopTime millisecond values
 */
export const onDurationKeyDown = (duration, index, event) => {
  const caretPos = document.activeElement.selectionStart;
  let newDuration = duration[index];

  switch (event.key) {
    case 'Enter':
      document.activeElement.blur();
      break;
    case 'Backspace':
      if (caretPos === newDuration.length && newDuration.slice(-1) === ':') {
        newDuration = newDuration.slice(0, -1);
      }
      break;
    default:
      break;
  }

  return {
    ...duration,
    [index]: newDuration,
  };
};

/**
 * valueFromDuration(duration)
 * Returns a millisecond duration value from the given 'hh:mm:ss' format string
 * @param {string} duration - duration in 'hh:mm:ss' format
 * @return {number} - duration in milliseconds. Returns null if duration is invalid.
 */
export const valueFromDuration = (duration) => {
  let matches = duration.trim().match(durationMatcher);
  if (!matches) {
    return 0;
  }
  matches = matches.slice(1).filter(v => v !== undefined);
  if (matches.length < 3) {
    for (let i = 0; i <= 3 - matches.length; i++) {
      matches.unshift(0);
    }
  }
  const [hours, minutes, seconds] = matches.map(x => parseInt(x, 10) || 0);
  return ((hours * 60 + minutes) * 60 + seconds) * 1000;
};

export default {
  durationWidget,
  durationString,
  durationStringFromValue,
  updateDuration,
  onDurationChange,
  onDurationKeyDown,
  valueFromDuration,
};
