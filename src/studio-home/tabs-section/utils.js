/**
 * Alphabetical sorting for arrays of courses and libraries.
 *
 * @param {array} arr - Array of courses or libraries.
 * @returns {array} - An array of alphabetically sorted courses or libraries.
 */
const sortAlphabeticallyArray = (arr) => [...arr]
  .sort((firstArrayData, secondArrayData) => {
    const firstDisplayName = firstArrayData.displayName ?? '';
    const secondDisplayName = secondArrayData.displayName ?? '';
    return firstDisplayName.localeCompare(secondDisplayName);
  });

const isMixedOrV1LibrariesMode = (libMode) => ['mixed', 'v1 only'].includes(libMode);
const isMixedOrV2LibrariesMode = (libMode) => ['mixed', 'v2 only'].includes(libMode);

export {
  sortAlphabeticallyArray,
  isMixedOrV1LibrariesMode,
  isMixedOrV2LibrariesMode,
};
