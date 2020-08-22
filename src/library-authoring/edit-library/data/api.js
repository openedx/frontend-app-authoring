import { ensureConfig, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

ensureConfig(['STUDIO_BASE_URL'], 'library API service');

/* eslint-disable-next-line import/prefer-default-export */
export async function updateLibrary({ libraryId, ...data }) {
  const client = getAuthenticatedHttpClient();
  const baseUrl = getConfig().STUDIO_BASE_URL;
  await client.patch(
    `${baseUrl}/api/libraries/v2/${libraryId}/`,
    data,
  ).catch((error) => {
    /* Normalize error data. */
    const apiError = Object.create(error);
    apiError.message = null;
    apiError.fields = JSON.parse(error.customAttributes.httpErrorResponseData);
    throw apiError;
  });
}
