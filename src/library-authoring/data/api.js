// @ts-check
import { camelCaseObject, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

const getApiBaseUrl = () => getConfig().STUDIO_BASE_URL;
/**
 * Get the URL for the content library API.
 * @param {string} libraryId - The ID of the library to fetch.
 */
const getContentLibraryApiUrl = (libraryId) => `${getApiBaseUrl()}/api/libraries/v2/${libraryId}/`;

/**
 * Fetch a content library by its ID.
 * @param {string} [libraryId] - The ID of the library to fetch.
 * @returns {Promise<import("./types.mjs").ContentLibrary>}
 */
/* eslint-disable import/prefer-default-export */
export async function getContentLibrary(libraryId) {
  if (!libraryId) {
    throw new Error('libraryId is required');
  }

  const { data } = await getAuthenticatedHttpClient().get(getContentLibraryApiUrl(libraryId));
  return camelCaseObject(data);
}
