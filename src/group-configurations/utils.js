import { getConfig } from '@edx/frontend-platform';

import messages from './messages';

/**
 * Formats the given URL to a unit page URL.
 * @param {string} url - The original part of URL.
 * @returns {string} - The formatted unit page URL.
 */
const formatUrlToUnitPage = (url) => new URL(url, getConfig().STUDIO_BASE_URL).href;

/**
 * Retrieves a list of group count based on the number of items.
 * @param {Array} items - The array of items to count.
 * @param {function} formatMessage - The function for formatting localized messages.
 * @returns {Array} - List of group count.
 */
const getGroupsCountMessage = (items, formatMessage) => {
  if (!items?.length) {
    return [];
  }

  return [formatMessage(messages.containsGroups, { len: items.length })];
};

/**
 * Retrieves a list of usage count based on the number of items.
 * @param {Array} items - The array of items to count.
 * @param {function} formatMessage - The function for formatting localized messages.
 * @returns {Array} - List of usage count.
 */
const getUsageCountMessage = (items, formatMessage) => {
  if (!items?.length) {
    return [formatMessage(messages.notInUse)];
  }

  return [formatMessage(messages.usedInLocations, { len: items.length })];
};

/**
 * Retrieves a combined list of badge messages based on usage and group information.
 * @param {Array} usage - The array of items indicating usage.
 * @param {Object} group - The group information.
 * @param {boolean} isExperiment - Flag indicating whether it is an experiment group configurations.
 * @param {function} formatMessage - The function for formatting localized messages.
 * @returns {Array} - Combined list of badges.
 */
const getCombinedBadgeList = (usage, group, isExperiment, formatMessage) => [
  ...(isExperiment ? getGroupsCountMessage(group.groups, formatMessage) : []),
  ...getUsageCountMessage(usage, formatMessage),
];

export { formatUrlToUnitPage, getCombinedBadgeList };
