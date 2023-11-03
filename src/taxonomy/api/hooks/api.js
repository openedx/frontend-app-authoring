// @ts-check
import { useQuery } from '@tanstack/react-query';
import { camelCaseObject, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

const getApiBaseUrl = () => getConfig().STUDIO_BASE_URL;
const getTaxonomyListApiUrl = new URL('api/content_tagging/v1/taxonomies/?enabled=true', getApiBaseUrl()).href;

/**
 * @returns {import("../types.mjs").UseQueryResult}
 */
const useTaxonomyListData = () => (
  useQuery({
    queryKey: ['taxonomyList'],
    queryFn: () => getAuthenticatedHttpClient().get(getTaxonomyListApiUrl)
      .then(camelCaseObject),
  })
);

export default useTaxonomyListData;
