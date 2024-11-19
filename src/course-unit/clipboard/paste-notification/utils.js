/**
 * Gets the status of an alert based on the length of a fileList.
 *
 * @param {Array<string>} fileList - The list of files.
 * @param {string} alertKey - The key associated with the alert in the alertState.
 * @param {Object} alertState - The state object containing alert statuses.
 * @returns {boolean|null} - The status of the alert. Returns `true` if the fileList has length,
 *                          `false` if it does not, and `null` if fileList is not defined.
 */
export const getAlertStatus = (fileList, alertKey, alertState) => (
  fileList?.length ? fileList && alertState[alertKey] : null);
