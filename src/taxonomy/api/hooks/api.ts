import { useQuery, QueryData } from '@tanstack/react-query';
import { camelCaseObject, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import * as types from '../types';

const getApiBaseUrl = () => getConfig().STUDIO_BASE_URL;
const getTaxonomyListApiUrl = new URL('api/content_tagging/v1/taxonomies/', getApiBaseUrl()).href;

export const useTaxonomyListData = (): QueryData<types.TaxonomyListData> => (
  useQuery({
    queryKey: ["taxonomyList"],
    queryFn: () =>  getAuthenticatedHttpClient().get(getTaxonomyListApiUrl)
      .then(camelCaseObject),
  })
);
