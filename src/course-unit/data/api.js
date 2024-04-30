// @ts-check
import { camelCaseObject, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import { PUBLISH_TYPES } from '../constants';
import { normalizeCourseSectionVerticalData, updateXBlockBlockIdToId } from './utils';

const getStudioBaseUrl = () => getConfig().STUDIO_BASE_URL;

export const getCourseUnitApiUrl = (itemId) => `${getStudioBaseUrl()}/xblock/container/${itemId}`;
export const getXBlockBaseApiUrl = (itemId) => `${getStudioBaseUrl()}/xblock/${itemId}`;
export const getCourseSectionVerticalApiUrl = (itemId) => `${getStudioBaseUrl()}/api/contentstore/v1/container_handler/${itemId}`;
export const getCourseVerticalChildrenApiUrl = (itemId) => `${getStudioBaseUrl()}/api/contentstore/v1/container/vertical/${itemId}/children`;
export const getXBlockContainerPreview = (itemId) => `${getStudioBaseUrl()}/xblock/${itemId}/container_preview`;
export const getCsrfTokenApiUrl = () => `${getStudioBaseUrl()}/csrf/api/v1/token`;

export const postXBlockBaseApiUrl = () => `${getStudioBaseUrl()}/xblock/`;

/**
 * Get course unit.
 * @param {string} unitId
 * @returns {Promise<Object>}
 */
export async function getCourseUnitData(unitId) {
  const { data } = await getAuthenticatedHttpClient()
    .get(getCourseUnitApiUrl(unitId));

  return camelCaseObject(data);
}

/**
 * Edit course unit display name.
 * @param {string} unitId
 * @param {string} displayName
 * @returns {Promise<Object>}
 */
export async function editUnitDisplayName(unitId, displayName) {
  const { data } = await getAuthenticatedHttpClient()
    .post(getXBlockBaseApiUrl(unitId), {
      metadata: {
        display_name: displayName,
      },
    });

  return data;
}

/**
 * Get an object containing course section vertical data.
 * @param {string} unitId
 * @returns {Promise<Object>}
 */
export async function getCourseSectionVerticalData(unitId) {
  const { data } = await getAuthenticatedHttpClient()
    .get(getCourseSectionVerticalApiUrl(unitId));

  return normalizeCourseSectionVerticalData(data);
}

/**
 * Creates a new course XBlock.
 * @param {Object} options - The options for creating the XBlock.
 * @param {string} options.type - The type of the XBlock.
 * @param {string} [options.category] - The category of the XBlock. Defaults to the type if not provided.
 * @param {string} options.parentLocator - The parent locator.
 * @param {string} [options.displayName] - The display name.
 * @param {string} [options.boilerplate] - The boilerplate.
 * @param {string} [options.stagedContent] - The staged content.
 */
export async function createCourseXblock({
  type, category, parentLocator, displayName, boilerplate, stagedContent,
}) {
  const body = {
    type,
    boilerplate,
    category: category || type,
    parent_locator: parentLocator,
    display_name: displayName,
    staged_content: stagedContent,
  };

  const { data } = await getAuthenticatedHttpClient()
    .post(postXBlockBaseApiUrl(), body);

  return data;
}

/**
 * Handles the visibility and data of a course unit, such as publishing, resetting to default values,
 * and toggling visibility to students.
 * @param {string} unitId - The ID of the course unit.
 * @param {string} type - The action type (e.g., PUBLISH_TYPES.discardChanges).
 * @param {boolean} isVisible - The visibility status for students.
 * @param {boolean} groupAccess - Access group key set.
 * @returns {Promise<any>} A promise that resolves with the response data.
 */
export async function handleCourseUnitVisibilityAndData(unitId, type, isVisible, groupAccess) {
  const body = {
    publish: groupAccess ? null : type,
    ...(type === PUBLISH_TYPES.republish ? {
      metadata: {
        visible_to_staff_only: isVisible ? true : null,
        group_access: groupAccess || null,
      },
    } : {}),
  };

  const { data } = await getAuthenticatedHttpClient()
    .post(getXBlockBaseApiUrl(unitId), body);

  return camelCaseObject(data);
}

/**
 * Get an object containing course section vertical children data.
 * @param {string} itemId
 * @returns {Promise<Object>}
 */
export async function getCourseVerticalChildren(itemId) {
  const { data } = await getAuthenticatedHttpClient()
    .get(getCourseVerticalChildrenApiUrl(itemId));
  const camelCaseData = camelCaseObject(data);

  return updateXBlockBlockIdToId(camelCaseData);
}

/**
 * Delete a unit item.
 * @param {string} itemId
 * @returns {Promise<Object>}
 */
export async function deleteUnitItem(itemId) {
  const { data } = await getAuthenticatedHttpClient()
    .delete(getXBlockBaseApiUrl(itemId));

  return data;
}

/**
 * Duplicate a unit item.
 * @param {string} itemId
 * @param {string} XBlockId
 * @returns {Promise<Object>}
 */
export async function duplicateUnitItem(itemId, XBlockId) {
  const { data } = await getAuthenticatedHttpClient()
    .post(postXBlockBaseApiUrl(), {
      parent_locator: itemId,
      duplicate_source_locator: XBlockId,
    });

  return data;
}

/**
 * Sets the order list of XBlocks.
 * @param {string} blockId - The identifier of the course unit.
 * @param {Object[]} children - The array of child elements representing the updated order of XBlocks.
 * @returns {Promise<Object>} - A promise that resolves to the updated data after setting the XBlock order.
 */
export async function setXBlockOrderList(blockId, children) {
  const { data } = await getAuthenticatedHttpClient()
    .put(getXBlockBaseApiUrl(blockId), { children });

  return data;
}

/**
 * Fetches XBlock iframe data.
 * @param {string} itemId - The ID of the XBlock item.
 * @returns {Promise<Object>} A Promise that resolves with the XBlock iframe data.
 */
export async function getXBlockIFrameData(itemId) {
  const { data } = await getAuthenticatedHttpClient()
    .get(getXBlockContainerPreview(itemId));

  return camelCaseObject(data);
}

export const getHandlerUrl = async (blockId) => {
  const baseUrl = getConfig().STUDIO_BASE_URL;

  return `${baseUrl}/preview/xblock/${blockId}/handler/handler_name`;
};

/**
 * Fetches CSRF token data from the server.
 * @returns {Promise<Object>} A Promise that resolves to an object containing CSRF token data.
 */
export async function getCsrfTokenData() {
  const { data } = await getAuthenticatedHttpClient()
    .get(getCsrfTokenApiUrl());

  return camelCaseObject(data);
}
