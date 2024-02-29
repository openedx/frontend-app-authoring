import { isArray } from 'lodash';

import { ALPHABET_LETTERS } from './constants';

/**
 * Generates the next unique group name based on existing group names.
 * @param {Array} groups - An array of group objects.
 * @param {string} groupFieldName - Optional. The name of the field containing the group name. Default is 'name'.
 * @returns {Object} An object containing the next unique group name, along with additional information.
 */
const getNextGroupName = (groups, groupFieldName = 'name') => {
  const existingGroupNames = groups.map((group) => group.name);
  const lettersCount = ALPHABET_LETTERS.length;

  let nextIndex = existingGroupNames.length + 1;

  let groupName = '';
  while (nextIndex > 0) {
    groupName = ALPHABET_LETTERS[(nextIndex - 1) % lettersCount] + groupName;
    nextIndex = Math.floor((nextIndex - 1) / lettersCount);
  }

  let counter = 0;
  let newName = groupName;
  while (existingGroupNames.includes(`Group ${newName}`)) {
    counter++;
    let newIndex = existingGroupNames.length + 1 + counter;
    groupName = '';
    while (newIndex > 0) {
      groupName = ALPHABET_LETTERS[(newIndex - 1) % lettersCount] + groupName;
      newIndex = Math.floor((newIndex - 1) / lettersCount);
    }
    newName = groupName;
  }
  return { [groupFieldName]: `Group ${newName}`, version: 1, usage: [] };
};

/**
 * Calculates the percentage of groups values of total groups.
 * @param {number} totalGroups - Total number of groups.
 * @returns {string} The percentage of groups, each group has the same value.
 */
const getGroupPercentage = (totalGroups) => (totalGroups === 0 ? '0%' : `${Math.floor(100 / totalGroups)}%`);

/**
 * Checks if all group names in the array are unique.
 * @param {Array} groups - An array of group objects.
 * @returns {boolean} True if all group names are unique, otherwise false.
 */
const allGroupNamesAreUnique = (groups) => {
  const names = groups.map((group) => group.name);
  return new Set(names).size === names.length;
};

/**
 * Formats form group errors into an object. Because we need to handle both type errors.
 * @param {Array|string} errors - The form group errors.
 * @returns {Object} An object containing arrayErrors and stringError properties.
 */
const getFormGroupErrors = (errors) => {
  const arrayErrors = isArray(errors) ? errors : [];
  const stringError = isArray(errors) ? '' : errors || '';

  return { arrayErrors, stringError };
};

export {
  allGroupNamesAreUnique,
  getNextGroupName,
  getGroupPercentage,
  getFormGroupErrors,
};
