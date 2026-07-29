import { camelCaseObject, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import { CourseContainerChildrenData, CourseOutlineData, MoveInfoData } from './types';
import { isUnitImportedFromLib, normalizeCourseSectionVerticalData, updateXBlockBlockIdToId } from './utils';

const getStudioBaseUrl = () => getConfig().STUDIO_BASE_URL;

// FC-0118 (ADR 0028/0037): standardized v1 xblock REST endpoint. The trailing
// slash is required by the DRF DefaultRouter that serves the v1 XblockViewSet
// (the legacy `/xblock/{id}` route had none). Detail actions: GET (retrieve),
// PUT/PATCH (update), DELETE (destroy).
export const getXBlockBaseApiUrl = (itemId: string) => `${getStudioBaseUrl()}/api/contentstore/v1/xblock/${itemId}/`;
export const getCourseSectionVerticalApiUrl = (itemId: string) =>
  `${getStudioBaseUrl()}/api/contentstore/v1/container_handler/${itemId}`;
export const getCourseVerticalChildrenApiUrl = (itemId: string, getUpstreamInfo: boolean = false) =>
  `${getStudioBaseUrl()}/api/contentstore/v1/container/${itemId}/children?get_upstream_info=${getUpstreamInfo}`;
export const getCourseOutlineInfoUrl = (courseId: string) => `${getStudioBaseUrl()}/course/${courseId}?format=concise`;
// FC-0118: v1 xblock collection endpoint — POST here creates a block.
export const postXBlockBaseApiUrl = () => `${getStudioBaseUrl()}/api/contentstore/v1/xblock/`;
export const libraryBlockChangesUrl = (blockId: string) =>
  `${getStudioBaseUrl()}/api/contentstore/v2/downstreams/${blockId}/sync`;

/**
 * Edit course unit display name.
 */
export async function editUnitDisplayName(unitId: string, displayName: string): Promise<object> {
  const { data } = await getAuthenticatedHttpClient()
    // FC-0118: legacy POST-as-update becomes PATCH (partial_update) on v1.
    .patch(getXBlockBaseApiUrl(unitId), {
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
  // FC-0118: the move used to PATCH the legacy collection URL (`/xblock/`); the
  // v1 REST viewset only exposes PATCH on the detail route, so we PATCH the
  // source block's detail URL. `update_xblock_response` still routes to the
  // move-item path off `move_source_locator` in the body (the URL key is used
  // only to derive the course for the permission check).
  const { data } = await getAuthenticatedHttpClient()
    .patch(getXBlockBaseApiUrl(sourceLocator), {
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
  blockId: string;
  overrideCustomizations?: boolean;
}) {
  await getAuthenticatedHttpClient()
    .post(libraryBlockChangesUrl(blockId), { override_customizations: overrideCustomizations });
}

/**
 * Ignore the changes from upstream library block in course
 */
export async function ignoreLibraryBlockChanges({ blockId }: { blockId: string; }) {
  await getAuthenticatedHttpClient()
    .delete(libraryBlockChangesUrl(blockId));
}
