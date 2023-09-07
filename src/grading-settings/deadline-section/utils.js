/**
 * Time format conversions for values (hours or minutes) that are less than 10.
 *
 * @param {number} time - incoming time data.
 * @returns {string} - formatted time string.
 */
export function formatTime(time) {
  return (time >= 10 ? time.toString() : `0${time}`);
}

/**
 * Validates inputStr as a time in HH:MM format.
 *
 * @param {string} inputStr - the input string to validate.
 * @param {function} setShowSavePrompt - a function to control save prompt display.
 * @param {function} setIsError - a function to set error state.
 * @returns {boolean} - returns `true` if `inputStr` is a valid time, else `false`.
 */
export function timerValidation(inputStr, setShowSavePrompt, setIsError) {
  const timePattern = /^(?:[01]\d|2[0-3]):[0-5]\d$/;

  const isValid = timePattern.test(inputStr);
  setShowSavePrompt(isValid);
  setIsError(!isValid);

  return isValid;
}
