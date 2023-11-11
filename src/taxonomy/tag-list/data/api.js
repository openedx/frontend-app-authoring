// @ts-check
import { useQuery } from '@tanstack/react-query';
import { camelCaseObject, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

const getApiBaseUrl = () => getConfig().STUDIO_BASE_URL;
const getTagListApiUrl = (taxonomyId, page) => new URL(
  `api/content_tagging/v1/taxonomies/${taxonomyId}/tags/?page=${page + 1}`,
  getApiBaseUrl(),
).href;

// ToDo: fix types
/**
 * @param {number} taxonomyId
 * @param {import('./types.mjs').QueryOptions} options
 * @returns {import('@tanstack/react-query').UseQueryResult<import('./types.mjs').TagListData>}
 */ // eslint-disable-next-line import/prefer-default-export
export const useTagListData = (taxonomyId, options) => {
  const { pageIndex } = options;
  return useQuery({
    queryKey: ['tagList', taxonomyId, pageIndex],
    queryFn: () => getAuthenticatedHttpClient().get(getTagListApiUrl(taxonomyId, pageIndex))
      .then((response) => response.data)
      .then(camelCaseObject),
  });
};
