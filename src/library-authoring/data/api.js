// @ts-check
import { camelCaseObject, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

const getApiBaseUrl = () => getConfig().STUDIO_BASE_URL;
/**
 * Get the URL for the content library API.
 * @param {string} libraryId - The ID of the library to fetch.
 */
export const getContentLibraryApiUrl = (libraryId) => `${getApiBaseUrl()}/api/libraries/v2/${libraryId}/`;
/**
 * Get the URL for get block types of library.
 * @param {string} libraryId - The ID of the library to fetch.
 */
export const getLibraryBlockTypesUrl = (libraryId) => `${getApiBaseUrl()}/api/libraries/v2/${libraryId}/block_types/`;

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

/**
 * Fetch block types of a library
 * @param {string} libraryId
 * @returns {Promise<import("./types.mjs").LibraryBlockType[]>}
 */
export async function getLibraryBlockTypes(libraryId) {
  if (!libraryId) {
    throw new Error('libraryId is required');
  }

  const { data } = await getAuthenticatedHttpClient().get(getLibraryBlockTypesUrl(libraryId));
  return camelCaseObject(data);
}
