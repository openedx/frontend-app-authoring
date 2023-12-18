// @ts-check

// TODO: this file needs to be merged into src/taxonomy/data/api.js
// We are creating a mess with so many different /data/[api|types].js files in subfolders.
// There is only one tagging/taxonomy API, and it should be implemented via a single types.mjs and api.js file.

import { camelCaseObject, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { useQuery } from '@tanstack/react-query';

const getApiBaseUrl = () => getConfig().STUDIO_BASE_URL;
const getTaxonomyDetailApiUrl = (taxonomyId) => new URL(
  `api/content_tagging/v1/taxonomies/${taxonomyId}/`,
  getApiBaseUrl(),
).href;

/**
 * @param {number} taxonomyId
 * @returns {import('@tanstack/react-query').UseQueryResult<import('../../data/types.mjs').TaxonomyData>}
 */ // eslint-disable-next-line import/prefer-default-export
export const useTaxonomyDetailData = (taxonomyId) => (
  useQuery({
    queryKey: ['taxonomyDetail', taxonomyId],
    queryFn: () => getAuthenticatedHttpClient().get(getTaxonomyDetailApiUrl(taxonomyId))
      .then((response) => response.data)
      .then(camelCaseObject),
  })
);
