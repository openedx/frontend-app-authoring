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

  /* Fetch modulestore and blockstore libraries simultaneously. */
  const [v1Response, v2Response] = await Promise.all([
    client.get(`${baseUrl}/library/`, { params }),
    client.get(`${baseUrl}/api/libraries/v2/`, { params }),
  ]);

  /* Normalize modulestore properties to conform to the v2 API, marking them as
   * type LEGACY in the process. */
  const v1Libraries = v1Response.data.map(library => {
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
      type: LIBRARY_TYPES.LEGACY,
    };
  });

  /* Mark blockstore libraries as COMPLEX. */
  const v2Libraries = v2Response.data.map(lib => ({
    ...lib,
    type: LIBRARY_TYPES.COMPLEX,
  }));

  /* Concatenate the libraries and sort them by title. */
  const libraries = v2Libraries.concat(v1Libraries);
  libraries.sort((a, b) => {
    const titleA = a.title.toLowerCase();
    const titleB = b.title.toLowerCase();

    if (titleA < titleB) {
      return -1;
    }

    if (titleA > titleB) {
      return 1;
    }

    return 0;
  });

  return libraries;
}
