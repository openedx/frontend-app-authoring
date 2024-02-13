// @ts-check

// TODO: this file needs to be merged into src/taxonomy/data/api.js
// We are creating a mess with so many different /data/[api|types].js files in subfolders.
// There is only one tagging/taxonomy API, and it should be implemented via a single types.mjs and api.js file.

import { useQuery } from '@tanstack/react-query';
import { camelCaseObject, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

const getApiBaseUrl = () => getConfig().STUDIO_BASE_URL;
const getTagListApiUrl = (taxonomyId, page, pageSize) => new URL(
  `api/content_tagging/v1/taxonomies/${taxonomyId}/tags/?page=${page + 1}&page_size=${pageSize}`,
  getApiBaseUrl(),
).href;

/**
 * @param {number} taxonomyId
 * @param {import('./types.mjs').QueryOptions} options
 * @returns {import('@tanstack/react-query').UseQueryResult<import('./types.mjs').TagListData>}
 */
export const useTagListData = (taxonomyId, options) => {
  const { pageIndex } = options;
  const pageSize = 100;
  return useQuery({
    queryKey: ['tagList', taxonomyId, pageIndex],
    queryFn: async () => {
      const { data } = await getAuthenticatedHttpClient().get(getTagListApiUrl(taxonomyId, pageIndex, pageSize));
      return camelCaseObject(data);
    },
  });
};

/**
 * Temporary hook to load *all* the subtags of a given tag in a taxonomy.
 * Doesn't handle pagination or anything. This is meant to be replaced by
 * something more sophisticated later, as we improve the "taxonomy details" page.
 * @param {number} taxonomyId
 * @param {string} parentTagValue
 * @returns {import('@tanstack/react-query').UseQueryResult<import('./types.mjs').TagListData>}
 */
export const useSubTags = (taxonomyId, parentTagValue) => useQuery({
  queryKey: ['subtagsList', taxonomyId, parentTagValue],
  queryFn: async () => {
    const url = new URL(`api/content_tagging/v1/taxonomies/${taxonomyId}/tags/`, getApiBaseUrl());
    url.searchParams.set('full_depth_threshold', '10000'); // Load as deeply as we can
    url.searchParams.set('parent_tag', parentTagValue);
    const response = await getAuthenticatedHttpClient().get(url.href);
    return camelCaseObject(response.data);
  },
});
