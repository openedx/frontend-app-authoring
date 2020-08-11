import { ensureConfig, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import { LIBRARY_TYPES } from '../../common';

ensureConfig(['STUDIO_BASE_URL'], 'library API service');

async function getLibraryDetail(libraryId) {
  const client = getAuthenticatedHttpClient();
  const baseUrl = getConfig().STUDIO_BASE_URL;

  /* Fetch the library. */
  const response = await client.get(`${baseUrl}/api/libraries/v2/${libraryId}/`);
  const library = {
    ...response.data,
    type: LIBRARY_TYPES.COMPLEX,
  };

  return library;
}

export default getLibraryDetail;
