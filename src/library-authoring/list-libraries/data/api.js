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

  /* Fetch modulestore and blockstore libraries simultaneously, if required. */
  let v1Request;
  let v2Request;
  if (params.type === LIBRARY_TYPES.LEGACY) {
    v1Request = client.get(`${baseUrl}/library/`, { params });
  } else if (!params.type) {
    v1Request = client.get(`${baseUrl}/library/`, { params });
    v2Request = client.get(`${baseUrl}/api/libraries/v2/`, { params });
  } else {
    v2Request = client.get(`${baseUrl}/api/libraries/v2/`, { params });
  }
  const promises = [v1Request, v2Request].filter(x => !!x);
  await Promise.all(promises);
  let v1Libraries = [];
  let v2Libraries = [];

  /* Normalize modulestore properties to conform to the v2 API, marking them as
   * type LEGACY in the process. */
  if (v1Request) {
    // Should return immediately since promise was already fulfilled.
    v1Libraries = (await v1Request).data.map(library => {
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
    });
  }

  if (v2Request) {
    // Should return immediately since promise was already fulfilled.
    v2Libraries = (await v2Request).data;
  }

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
