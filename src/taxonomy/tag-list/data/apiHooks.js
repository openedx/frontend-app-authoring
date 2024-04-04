// @ts-check

// TODO: this file needs to be merged into src/taxonomy/data/apiHooks.js

import { useQuery } from '@tanstack/react-query';
import { camelCaseObject } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { apiUrls } from '../../data/api';
import { taxonomyQueryKeys } from '../../data/apiHooks';

/**
 * @param {number} taxonomyId
 * @param {import('./types.mjs').QueryOptions} options
 * @returns {import('@tanstack/react-query').UseQueryResult<import('./types.mjs').TagListData>}
 */
export const useTagListData = (taxonomyId, options) => {
  const { pageIndex, pageSize } = options;
  return useQuery({
    queryKey: taxonomyQueryKeys.taxonomyTagListPage(taxonomyId, pageIndex, pageSize),
    queryFn: async () => {
      const { data } = await getAuthenticatedHttpClient().get(apiUrls.tagList(taxonomyId, pageIndex, pageSize));
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
  queryKey: taxonomyQueryKeys.taxonomyTagSubtagsList(taxonomyId, parentTagValue),
  queryFn: async () => {
    const response = await getAuthenticatedHttpClient().get(apiUrls.allSubtagsOf(taxonomyId, parentTagValue));
    return camelCaseObject(response.data);
  },
});
