import { camelCaseObject, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import { PUBLISH_TYPES } from '../constants';
import { CourseContainerChildrenData, CourseOutlineData, MoveInfoData } from './types';
import { isUnitImportedFromLib, normalizeCourseSectionVerticalData, updateXBlockBlockIdToId } from './utils';

const getStudioBaseUrl = () => getConfig().STUDIO_BASE_URL;

export const getXBlockBaseApiUrl = (itemId: string) => `${getStudioBaseUrl()}/xblock/${itemId}`;
export const getCourseSectionVerticalApiUrl = (itemId: string) => `${getStudioBaseUrl()}/api/contentstore/v1/container_handler/${itemId}`;
export const getCourseVerticalChildrenApiUrl = (itemId: string, getUpstreamInfo: boolean = false) => `${getStudioBaseUrl()}/api/contentstore/v1/container/${itemId}/children?get_upstream_info=${getUpstreamInfo}`;
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
 * Handles the visibility and data of a course unit, such as publishing, resetting to default values,
 * and toggling visibility to students.
 */
export async function handleCourseUnitVisibilityAndData(
  unitId: string,
  type: string, // The action type (e.g., PUBLISH_TYPES.discardChanges).
  isVisible: boolean, // The visibility status for students.
  isDiscussionEnabled: boolean,
  groupAccess: Record<string, any> | null,
): Promise<object> {
  const body = {
    publish: groupAccess ? null : type,
    ...(type === PUBLISH_TYPES.republish ? {
      metadata: {
        visible_to_staff_only: isVisible ? true : null,
        discussion_enabled: isDiscussionEnabled,
        ...(groupAccess != null && { group_access: groupAccess }),
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
export async function getCourseContainerChildren(
  itemId: string,
  getUpstreamInfo: boolean = false,
): Promise<CourseContainerChildrenData> {
  const { data } = await getAuthenticatedHttpClient()
    .get(getCourseVerticalChildrenApiUrl(itemId, getUpstreamInfo));
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
 */
export async function acceptLibraryBlockChanges({
  blockId,
  overrideCustomizations = false,
}: {
  blockId: string,
  overrideCustomizations?: boolean,
}) {
  await getAuthenticatedHttpClient()
    .post(libraryBlockChangesUrl(blockId), { override_customizations: overrideCustomizations });
}

/**
 * Ignore the changes from upstream library block in course
 */
export async function ignoreLibraryBlockChanges({ blockId } : { blockId: string }) {
  await getAuthenticatedHttpClient()
    .delete(libraryBlockChangesUrl(blockId));
}
