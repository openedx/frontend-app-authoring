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
export const getCourseOutlineInfoUrl = (courseId) => `${getStudioBaseUrl()}/course/${courseId}?format=concise`;
export const postXBlockBaseApiUrl = () => `${getStudioBaseUrl()}/xblock/`;
export const libraryBlockChangesUrl = (blockId) => `${getStudioBaseUrl()}/api/contentstore/v2/downstreams/${blockId}/sync`;

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
 * @param {string} [options.libraryContentKey] - component key from library if being imported.
 */
export async function createCourseXblock({
  type,
  category,
  parentLocator,
  displayName,
  boilerplate,
  stagedContent,
  libraryContentKey,
}) {
  const body = {
    type,
    boilerplate,
    category: category || type,
    parent_locator: parentLocator,
    display_name: displayName,
    staged_content: stagedContent,
    library_content_key: libraryContentKey,
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
export async function handleCourseUnitVisibilityAndData(unitId, type, isVisible, groupAccess, isDiscussionEnabled) {
  const body = {
    publish: groupAccess ? null : type,
    ...(type === PUBLISH_TYPES.republish ? {
      metadata: {
        visible_to_staff_only: isVisible ? true : null,
        group_access: groupAccess || null,
        discussion_enabled: isDiscussionEnabled,
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
 * @typedef {Object} courseOutline
 * @property {string} id - The unique identifier of the course.
 * @property {string} displayName - The display name of the course.
 * @property {string} category - The category of the course (e.g., "course").
 * @property {boolean} hasChildren - Whether the course has child items.
 * @property {boolean} unitLevelDiscussions - Indicates if unit-level discussions are available.
 * @property {Object} childInfo - Information about the child elements of the course.
 * @property {string} childInfo.category - The category of the child (e.g., "chapter").
 * @property {string} childInfo.display_name - The display name of the child element.
 * @property {Array<Object>} childInfo.children - List of children within the child_info (could be empty).
 */

/**
 * Get an object containing course outline data.
 * @param {string} courseId - The identifier of the course.
 * @returns {Promise<courseOutline>} - The course outline data.
 */
export async function getCourseOutlineInfo(courseId) {
  const { data } = await getAuthenticatedHttpClient()
    .get(getCourseOutlineInfoUrl(courseId));

  return camelCaseObject(data);
}

/**
 * @typedef {Object} moveInfo
 * @property {string} moveSourceLocator - The locator of the source block being moved.
 * @property {string} parentLocator - The locator of the parent block where the source is being moved to.
 * @property {number} sourceIndex - The index position of the source block.
 */

/**
 * Move a unit item to new unit.
 * @param {string} sourceLocator - The ID of the item to be moved.
 * @param {string} targetParentLocator - The ID of the XBlock associated with the item.
 * @returns {Promise<moveInfo>} - The move information.
 */
export async function patchUnitItem(sourceLocator, targetParentLocator) {
  const { data } = await getAuthenticatedHttpClient()
    .patch(postXBlockBaseApiUrl(), {
      parent_locator: targetParentLocator,
      move_source_locator: sourceLocator,
    });

  return camelCaseObject(data);
}

/**
 * Accept the changes from upstream library block in course
 * @param {string} blockId - The ID of the item to be updated from library.
 */
export async function acceptLibraryBlockChanges(blockId) {
  await getAuthenticatedHttpClient()
    .post(libraryBlockChangesUrl(blockId));
}

/**
 * Ignore the changes from upstream library block in course
 * @param {string} blockId - The ID of the item to be updated from library.
 */
export async function ignoreLibraryBlockChanges(blockId) {
  await getAuthenticatedHttpClient()
    .delete(libraryBlockChangesUrl(blockId));
}
