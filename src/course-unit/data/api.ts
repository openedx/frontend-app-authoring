// @ts-check
import { camelCaseObject, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import { PUBLISH_TYPES } from '../constants';
import { CourseContainerChildrenData, CourseOutlineData, MoveInfoData } from './types';
import { isUnitImportedFromLib, normalizeCourseSectionVerticalData, updateXBlockBlockIdToId } from './utils';

const getStudioBaseUrl = () => getConfig().STUDIO_BASE_URL;

export const getXBlockBaseApiUrl = (itemId: string) => `${getStudioBaseUrl()}/xblock/${itemId}`;
export const getCourseSectionVerticalApiUrl = (itemId: string) => `${getStudioBaseUrl()}/api/contentstore/v1/container_handler/${itemId}`;
export const getCourseVerticalChildrenApiUrl = (itemId: string) => `${getStudioBaseUrl()}/api/contentstore/v1/container/${itemId}/children`;
export const getCourseOutlineInfoUrl = (courseId: string) => `${getStudioBaseUrl()}/course/${courseId}?format=concise`;
export const postXBlockBaseApiUrl = () => `${getStudioBaseUrl()}/xblock/`;
export const libraryBlockChangesUrl = (blockId: string) => `${getStudioBaseUrl()}/api/contentstore/v2/downstreams/${blockId}/sync`;

/**
 * Edit course unit display name.
 */
export async function editUnitDisplayName(unitId: string, displayName: string): Promise<object> {
  const { data } = await getAuthenticatedHttpClient()
    .post(getXBlockBaseApiUrl(unitId), {
      metadata: {
        display_name: displayName,
      },
    });

  return data;
}

/**
 * Fetch vertical block data from the container_handler endpoint.
 */
export async function getVerticalData(unitId: string): Promise<object> {
  const { data } = await getAuthenticatedHttpClient()
    .get(getCourseSectionVerticalApiUrl(unitId));

  const courseSectionVerticalData = normalizeCourseSectionVerticalData(data);
  courseSectionVerticalData.xblockInfo.readOnly = isUnitImportedFromLib(courseSectionVerticalData.xblockInfo);

  return courseSectionVerticalData;
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
}: {
  type: string,
  category?: string,
  parentLocator: string,
  displayName?: string,
  boilerplate?: string,
  stagedContent?: string,
  libraryContentKey?: string,
}): Promise<any> {
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
 */
export async function handleCourseUnitVisibilityAndData(
  unitId: string,
  type: string,
  isVisible: boolean,
  groupAccess: boolean,
  isDiscussionEnabled: boolean,
): Promise<object> {
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
 * Get an object containing course vertical children data.
 */
export async function getCourseContainerChildren(itemId: string): Promise<CourseContainerChildrenData> {
  const { data } = await getAuthenticatedHttpClient()
    .get(getCourseVerticalChildrenApiUrl(itemId));
  const camelCaseData = camelCaseObject(data);

  return updateXBlockBlockIdToId(camelCaseData) as CourseContainerChildrenData;
}

/**
 * Delete a unit item.
 */
export async function deleteUnitItem(itemId: string): Promise<object> {
  const { data } = await getAuthenticatedHttpClient()
    .delete(getXBlockBaseApiUrl(itemId));

  return data;
}

/**
 * Duplicate a unit item.
 */
export async function duplicateUnitItem(itemId: string, XBlockId: string): Promise<object> {
  const { data } = await getAuthenticatedHttpClient()
    .post(postXBlockBaseApiUrl(), {
      parent_locator: itemId,
      duplicate_source_locator: XBlockId,
    });

  return data;
}

/**
 * Get an object containing course outline data.
 */
export async function getCourseOutlineInfo(courseId: string): Promise<CourseOutlineData> {
  const { data } = await getAuthenticatedHttpClient()
    .get(getCourseOutlineInfoUrl(courseId));

  return camelCaseObject(data);
}

/**
 * Move a unit item to new unit.
 * @param {string} sourceLocator - The ID of the item to be moved.
 * @param {string} targetParentLocator - The ID of the XBlock associated with the item.
 * @returns {Promise<moveInfo>} - The move information.
 */
export async function patchUnitItem(sourceLocator: string, targetParentLocator: string): Promise<MoveInfoData> {
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
export async function acceptLibraryBlockChanges(blockId: string) {
  await getAuthenticatedHttpClient()
    .post(libraryBlockChangesUrl(blockId));
}

/**
 * Ignore the changes from upstream library block in course
 * @param {string} blockId - The ID of the item to be updated from library.
 */
export async function ignoreLibraryBlockChanges(blockId: string) {
  await getAuthenticatedHttpClient()
    .delete(libraryBlockChangesUrl(blockId));
}
