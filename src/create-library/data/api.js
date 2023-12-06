import { ensureConfig, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import { LIBRARY_TYPES } from '@src/library-authoring/common';

ensureConfig([
  'STUDIO_BASE_URL',
  'BLOCKSTORE_COLLECTION_UUID',
], 'Library API service');

/* eslint-disable-next-line import/prefer-default-export */
export async function createLibrary({ type, ...data }) {
  const client = getAuthenticatedHttpClient();
  const { STUDIO_BASE_URL, BLOCKSTORE_COLLECTION_UUID } = getConfig();

  let response;
  let library;
  if (type === LIBRARY_TYPES.LEGACY) {
    response = await client.post(`${STUDIO_BASE_URL}/library/`, {
      org: data.org,
      number: data.slug,
      display_name: data.title,
    }).catch((error) => {
      /* Normalize error data. */
      const apiError = Object.create(error);
      apiError.message = JSON.parse(error.customAttributes.httpErrorResponseData).ErrMsg;
      apiError.fields = null;
      throw apiError;
    });
    library = {
      id: response.data.library_key,
      org: data.org,
      slug: data.slug,
      bundle_uuid: null,
      title: data.title,
      description: null,
      version: null,
      type: LIBRARY_TYPES.LEGACY,
      has_unpublished_changes: false,
      has_unpublished_deletes: false,
    };
  } else if (Object.values(LIBRARY_TYPES).includes(type)) {
    response = await client.post(`${STUDIO_BASE_URL}/api/libraries/v2/`, {
      ...data,
      type,
      description: data.title,
      collection_uuid: BLOCKSTORE_COLLECTION_UUID,
    }).catch((error) => {
      /* Normalize error data. */
      const apiError = Object.create(error);
      apiError.message = null;
      apiError.fields = JSON.parse(error.customAttributes.httpErrorResponseData);
      throw apiError;
    });
    library = {
      ...response.data,
      type,
    };
  } else {
    /* Normalize error data. */
    const apiError = new Error();
    apiError.message = null;
    apiError.fields = { type: 'Unknown library type.' };
    throw apiError;
  }

  return library;
}
