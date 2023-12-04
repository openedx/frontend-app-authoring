import { ensureConfig, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import querystring from 'querystring';
import { annotateCall } from '../../common/data';

ensureConfig(['STUDIO_BASE_URL'], 'library API service');

export const getLibraryDetail = annotateCall(async (libraryId, controller) => {
  const client = getAuthenticatedHttpClient();
  const baseUrl = getConfig().STUDIO_BASE_URL;

  /* Fetch library details and block metadata simultaneously.
   *
   * This is temporary: in the future, block metadata will be fetched
   * separately so that it can be paginated. */
  const [detailResponse, blockTypeResponse] = await Promise.all([
    client.get(`${baseUrl}/api/libraries/v2/${libraryId}/`, { signal: controller?.signal }),
    client.get(`${baseUrl}/api/libraries/v2/${libraryId}/block_types/`, { signal: controller?.signal }),
  ]);

  const library = {
    ...detailResponse.data,
    blockTypes: blockTypeResponse.data,
  };

  return library;
});

export const getBlocks = annotateCall(async ({
  libraryId, paginationParams, controller = {}, query = '', types = [],
}) => {
  const client = getAuthenticatedHttpClient();
  const baseUrl = getConfig().STUDIO_BASE_URL;
  const params = {
    ...paginationParams,
    pagination: true,
  };

  if (query) {
    params.text_search = query;
  }

  if (types.length) {
    params.block_type = types;
  }

  let qs = querystring.stringify(params);
  if (qs) {
    qs = `?${qs}`;
  }

  const response = await client.get(`${baseUrl}/api/libraries/v2/${libraryId}/blocks/${qs}`, { signal: controller?.signal });

  return {
    data: response.data.results,
    count: response.data.count,
  };
});

export const getBlockLtiUrl = annotateCall(async ({ blockId }) => {
  const client = getAuthenticatedHttpClient();
  const baseUrl = getConfig().STUDIO_BASE_URL;

  const response = await client.get(`${baseUrl}/api/libraries/v2/blocks/${blockId}/lti/`);
  return response.data;
});

export const createLibraryBlock = annotateCall(async ({ libraryId, data }) => {
  const client = getAuthenticatedHttpClient();
  const baseUrl = getConfig().STUDIO_BASE_URL;
  const response = await client.post(
    `${baseUrl}/api/libraries/v2/${libraryId}/blocks/`,
    data,
  );

  return response.data;
});

export const commitLibraryChanges = annotateCall(async libraryId => {
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
});

export const revertLibraryChanges = annotateCall(async libraryId => {
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
});
