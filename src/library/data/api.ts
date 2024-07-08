import { camelCaseObject, snakeCaseObject, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

export const getApiBaseUrl = () => getConfig().STUDIO_BASE_URL;

export interface LibraryV2 {
  id: string,
  type: string,
  org: string,
  slug: string,
  title: string,
  description: string,
  numBlocks: number,
  version: number,
  lastPublished: string | null,
  allowLti: boolean,
  allowPublicLearning: boolean,
  allowPublicRead: boolean,
  hasUnpublishedChanges: boolean,
  hasUnpublishedDeletes: boolean,
  license: string,
}

export interface LibrariesV2Response {
  next: string | null,
  previous: string | null,
  count: number,
  numPages: number,
  currentPage: number,
  start: number,
  results: LibraryV2[],
}

/* Additional custom parameters for the API request. */
export interface GetLibrariesV2CustomParams {
  /* (optional) Library type, default `complex` */
  type?: string,
  /* (optional) Page number of results */
  page?: number,
  /* (optional) The number of results on each page, default `50` */
  pageSize?: number,
  /* (optional) Whether pagination is supported, default `true` */
  pagination?: boolean,
  /* (optional) Library field to order results by. Prefix with '-' for descending */
  order?: string,
  /* (optional) Search query to filter v2 Libraries by */
  search?: string,
}

/**
 * Get's studio home v2 Libraries.
 */
export async function getStudioHomeLibrariesV2(customParams: GetLibrariesV2CustomParams): Promise<LibrariesV2Response> {
  // Set default params if not passed in
  const customParamsDefaults = {
    type: customParams.type || 'complex',
    page: customParams.page || 1,
    pageSize: customParams.pageSize || 50,
    pagination: customParams.pagination !== undefined ? customParams.pagination : true,
    order: customParams.order || 'title',
    textSearch: customParams.search,
  };
  const customParamsFormat = snakeCaseObject(customParamsDefaults);
  const { data } = await getAuthenticatedHttpClient().get(`${getApiBaseUrl()}/api/libraries/v2/`, { params: customParamsFormat });
  return camelCaseObject(data);
}
