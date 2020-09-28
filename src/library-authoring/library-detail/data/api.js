import { ensureConfig, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

ensureConfig(['STUDIO_BASE_URL'], 'library API service');

export async function getLibraryDetail(libraryId) {
  const client = getAuthenticatedHttpClient();
  const baseUrl = getConfig().STUDIO_BASE_URL;

  /* Fetch library details and block metadata simultaneously.
   *
   * This is temporary: in the future, block metadata will be fetched
   * separately so that it can be paginated. */
  const [detailResponse, blockResponse, blockTypeResponse] = await Promise.all([
    client.get(`${baseUrl}/api/libraries/v2/${libraryId}/`),
    client.get(`${baseUrl}/api/libraries/v2/${libraryId}/blocks/`),
    client.get(`${baseUrl}/api/libraries/v2/${libraryId}/block_types/`),
  ]);

  const library = {
    ...detailResponse.data,
    blocks: blockResponse.data,
    blockTypes: blockTypeResponse.data,
  };

  return library;
}

export async function createLibraryBlock({ libraryId, ...data }) {
  const client = getAuthenticatedHttpClient();
  const baseUrl = getConfig().STUDIO_BASE_URL;
  const response = await client.post(
    `${baseUrl}/api/libraries/v2/${libraryId}/blocks/`,
    data,
  ).catch((error) => {
    /* Normalize error data. */
    const apiError = Object.create(error);
    [apiError.message] = JSON.parse(error.customAttributes.httpErrorResponseData);
    throw apiError;
  });

  return response.data;
}

export async function commitLibraryChanges(libraryId) {
  const client = getAuthenticatedHttpClient();
  const baseUrl = getConfig().STUDIO_BASE_URL;
  const response = await client.post(
    `${baseUrl}/api/libraries/v2/${libraryId}/commit/`,
  ).catch((error) => {
    /* Normalize error data. */
    const apiError = Object.create(error);
    [apiError.message] = JSON.parse(error.customAttributes.httpErrorResponseData);
    throw apiError;
  });

  return response.data;
}

export async function revertLibraryChanges(libraryId) {
  const client = getAuthenticatedHttpClient();
  const baseUrl = getConfig().STUDIO_BASE_URL;
  const response = await client.delete(
    `${baseUrl}/api/libraries/v2/${libraryId}/commit/`,
  ).catch((error) => {
    /* Normalize error data. */
    const apiError = Object.create(error);
    [apiError.message] = JSON.parse(error.customAttributes.httpErrorResponseData);
    throw apiError;
  });

  return response.data;
}
