// @ts-check
import { camelCaseObject, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

const getApiBaseUrl = () => getConfig().STUDIO_BASE_URL;
/**
 * Get the URL for the content library API.
 * @param {string} libraryId - The ID of the library to fetch.
 */
export const getContentLibraryApiUrl = (libraryId) => `${getApiBaseUrl()}/api/libraries/v2/${libraryId}/`;
// export const getLibraryBlocks = (libraryId) => `${getApiBaseUrl()}/`

/**
 * Fetch a content library by its ID.
 * @param {string} [libraryId] - The ID of the library to fetch.
 * @returns {Promise<import("./types.mjs").ContentLibrary>}
 */
export async function getContentLibrary(libraryId) {
  if (!libraryId) {
    throw new Error('libraryId is required');
  }

  const { data } = await getAuthenticatedHttpClient().get(getContentLibraryApiUrl(libraryId));
  return camelCaseObject(data);
}
