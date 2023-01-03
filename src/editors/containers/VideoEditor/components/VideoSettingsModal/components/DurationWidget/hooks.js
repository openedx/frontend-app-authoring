import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import { actions, selectors } from '../../../../../../data/redux';

import * as module from './hooks';

const durationMatcher = /^(\d{0,2}):?(\d{0,2})?:?(\d{0,2})?$/i;
const MAXTIME = 86399000;
const MINTIME = 1000;

export const durationWidget = ({ dispatch }) => {
  const formValue = useSelector(selectors.video.duration);
  const setFormValue = (val) => dispatch(actions.video.updateField({ duration: val }));
  const initialState = durationValue(formValue);
  const [local, setLocal] = useState(initialState);

  useEffect(() => {
    setLocal(durationValue(formValue))
  }, [formValue]);

  return {
    formValue,
    local,
    onBlur: (index) => (
      (e) => module.updateDuration({
        formValue,
        setFormValue,
        local,
        setLocal,
        index,
        durationString: e.target.value,
      })
    ),
    onChange: (index) => (
      (e) => setLocal(module.onDurationChange(local, index, e.target.value))
    ),
    onKeyDown: (index) => (
      (e) => setLocal(module.onDurationKeyDown(local, index, e))
    ),
  };
};

/**
 * durationValue(duration)
 * Returns the display value for embedded start and stop times
 * @param {object} duration - object containing startTime and stopTime millisecond values
 * @return {object} - start and stop time from incoming object mapped to duration strings.
 */
export const durationValue = (duration) => ({
  startTime: module.durationFromValue(duration.startTime),
  stopTime: module.durationFromValue(duration.stopTime),
});

/**
 * durationFromValue(value)
 * Returns a duration string in 'hh:mm:ss' format from the given ms value
 * @param {number} value - duration (in milliseconds)
 * @return {string} - duration in 'hh:mm:ss' format
 */
export const durationFromValue = (value) => {
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
 * updateDuration({ formValue, local, setLocal, setFormValue })
 * Returns a memoized callback based on inputs that updates local value and form value
 * if the new string is valid (formValue stores a number, local stores a string).
 * If the duration string is invalid, resets the local value to the latest good value.
 * @param {object} formValue - redux-stored durations in milliseconds
 * @param {object} local - hook-stored duration in 'hh:mm:ss' format
 * @param {func} setFormValue - set form value
 * @param {func} setLocal - set local object
 * @return {func} - callback to update duration locally and in redux
 *   updateDuration(args)(index, durationString)
 */
export const updateDuration = ({
  formValue,
  local,
  setFormValue,
  setLocal,
  index,
  durationString,
}) => {
    let newDurationString = durationString;
    let newValue = module.valueFromDuration(newDurationString);
    // maxTime is 23:59:59 or 86399 seconds
    if (newValue > MAXTIME) {
      newValue = MAXTIME;
    }
    // stopTime must be at least 1 second, if not zero
    if (index === 'stopTime' && newValue > 0 && newValue < MINTIME) {
      newValue = MINTIME;
    }
    // stopTime must be at least 1 second after startTime, except 0 means no custom stopTime
    if (index === 'stopTime' && newValue > 0 && newValue < (formValue.startTime + MINTIME)) {
      newValue = formValue.startTime + MINTIME;
    }
    // startTime must be at least 1 second before stopTime, except when stopTime is less than a second
    // (stopTime should only be less than a second if it's zero, but we're being paranoid)
    if (index === 'startTime' && formValue.stopTime >= MINTIME && newValue > (formValue.stopTime - MINTIME)) {
      newValue = formValue.stopTime - MINTIME;
    }
    newDurationString = module.durationFromValue(newValue);
    setLocal({ ...local, [index]: newDurationString });
    setFormValue({ ...formValue, [index]: newValue });
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
  durationValue,
  durationFromValue,
  updateDuration,
  onDurationChange,
  onDurationKeyDown,
  valueFromDuration,
};
