import { ensureConfig, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import { LIBRARY_TYPES, unpackLibraryKey } from '../../common';

ensureConfig(['STUDIO_BASE_URL'], 'library API service');

export async function getOrgList() {
  const client = getAuthenticatedHttpClient();
  const baseUrl = getConfig().STUDIO_BASE_URL;
  const response = await client.get(`${baseUrl}/organizations`);

  return response.data;
}

export async function getLibraryList(params) {
  const client = getAuthenticatedHttpClient();
  const baseUrl = getConfig().STUDIO_BASE_URL;
  const isLegacyLibraryType = params.type === LIBRARY_TYPES.LEGACY;

  const apiUrl = isLegacyLibraryType ? `${baseUrl}/library/` : `${baseUrl}/api/libraries/v2/`;
  const request = await client.get(apiUrl, {
    params: {
      ...params,
      pagination: true,
    },
  });

  // Should return immediately since promise was already fulfilled.
  const response = (await request).data;
  const libraries = isLegacyLibraryType
    ? response.results.map(library => {
      const { org, slug } = unpackLibraryKey(library.library_key);
      return {
        id: library.library_key,
        org,
        slug,
        bundle_uuid: null,
        title: library.display_name,
        description: null,
        version: null,
        has_unpublished_changes: false,
        has_unpublished_deletes: false,
        license: '',
        type: LIBRARY_TYPES.LEGACY,
      };
    })
    : response.results;

  return {
    data: libraries,
    count: response.count,
  };
}
