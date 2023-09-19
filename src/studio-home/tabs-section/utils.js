/**
 * Alphabetical sorting for arrays of courses and libraries.
 *
 * @param {array} arr - Array of courses or libraries.
 * @returns {array} - An array of alphabetically sorted courses or libraries.
 */
const sortAlphabeticallyArray = (arr) => [...arr]
  .sort((firstArrayData, secondArrayData) => firstArrayData
    .displayName.localeCompare(secondArrayData.displayName));

// eslint-disable-next-line import/prefer-default-export
export { sortAlphabeticallyArray };
