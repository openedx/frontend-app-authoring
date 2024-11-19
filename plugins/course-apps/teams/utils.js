import { getConfig } from '@edx/frontend-platform';

import { GroupTypes } from 'CourseAuthoring/data/constants';

/**
 * Check if a group type is enabled by the current configuration.
 * This is a temporary workaround to disable the OPEN MANAGED team type until it is fully adopted.
 * For more information, see: https://openedx.atlassian.net/wiki/spaces/COMM/pages/3885760525/Open+Managed+Group+Type
 * @param {string} groupType - the group type to check
 * @returns {boolean} - true if the group type is enabled
 */
export const isGroupTypeEnabled = (groupType) => {
  const enabledTypesByDefault = [
    GroupTypes.OPEN,
    GroupTypes.PUBLIC_MANAGED,
    GroupTypes.PRIVATE_MANAGED,
  ];
  const enabledTypesByConfig = {
    [GroupTypes.OPEN_MANAGED]: getConfig().ENABLE_OPEN_MANAGED_TEAM_TYPE,
  };
  return enabledTypesByDefault.includes(groupType) || enabledTypesByConfig[groupType] || false;
};
