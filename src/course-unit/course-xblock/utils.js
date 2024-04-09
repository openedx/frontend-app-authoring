import { getConfig } from '@edx/frontend-platform';

/**
 * Retrieves the base path for XBlock actions.
 * @param {string} xblockId - The ID of the XBlock.
 * @returns {string} The base path for XBlock actions.
 */
// eslint-disable-next-line import/prefer-default-export
export function getXBlockActionsBasePath(xblockId) {
  return `${getConfig().STUDIO_BASE_URL}/xblock/${xblockId}/actions`;
}
