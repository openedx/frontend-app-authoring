import { camelCaseObject, ensureConfig, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getAllPages } from '@src/generic/data/paginatedList';

export interface CustomPage {
  id: string;
  name?: string;
  courseStaffOnly?: boolean;
  tabId?: string;
  [key: string]: unknown;
}

ensureConfig([
  'STUDIO_BASE_URL',
], 'Course Apps API service');

export const getApiBaseUrl = (): string => getConfig().STUDIO_BASE_URL;
export const getCustomPagesApiUrl = (): string => `${getApiBaseUrl()}/api/authoring/v1/custom_pages/`;
export const getCustomPageOrderApiUrl = (courseId: string): string =>
  `${getApiBaseUrl()}/api/authoring/v1/courses/${courseId}/custom_page_order/`;

/**
 * Fetches the course custom pages for provided course.
 */
export async function getCustomPages(courseId: string): Promise<CustomPage[]> {
  // The course key goes in params, not in the URL, so that its "+" is percent-encoded.
  const pages = await getAllPages<Record<string, unknown>>(getCustomPagesApiUrl(), { course_key: courseId });
  return camelCaseObject(pages) as CustomPage[];
}

/**
 * Delete custom page for provided block.
 */
export async function deleteCustomPage(blockId: string): Promise<void> {
  await getAuthenticatedHttpClient()
    .delete(`${getApiBaseUrl()}/xblock/${blockId}`);
}

/**
 * Add custom page for provided course.
 */
export async function addCustomPage(courseId: string): Promise<Record<string, unknown>> {
  const v1CourseId = courseId.substring(7);
  const courseBlockId = `block-${v1CourseId}+type@course+block@course`;
  const { data } = await getAuthenticatedHttpClient()
    .put(`${getApiBaseUrl()}/xblock/`, {
      category: 'static_tab',
      parent_locator: courseBlockId,
    });
  return camelCaseObject(data) as Record<string, unknown>;
}

/**
 * Update custom page HTML for provided block.
 */
export async function updateCustomPage({ blockId, htmlString, metadata }: {
  blockId: string;
  htmlString?: string;
  metadata?: Record<string, unknown>;
}): Promise<Record<string, unknown>> {
  const { data } = await getAuthenticatedHttpClient()
    .put(`${getApiBaseUrl()}/xblock/${blockId}`, {
      id: blockId,
      data: htmlString,
      metadata,
    });
  return camelCaseObject(data) as Record<string, unknown>;
}

/**
 * Update order of custom pages, given their ids (usage keys) in the new order.
 */
export async function updateCustomPageOrder(courseId: string, pageIds: string[]): Promise<void> {
  await getAuthenticatedHttpClient()
    .put(getCustomPageOrderApiUrl(courseId), { custom_pages: pageIds });
}
