// @ts-check
import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

/** @typedef {import("../data/types.mjs").CreateBlockData} CreateBlockData */

const getApiBaseUrl = () => getConfig().STUDIO_BASE_URL;
export const getCreateLibraryBlockUrl = (libraryId) => new URL(`api/libraries/v2/${libraryId}/blocks/`, getApiBaseUrl()).href;

/**
 * Creates a block in a library
 * @param {CreateBlockData} data
 * @returns {Promise<Object>}
 */
export async function createLibraryBlock({ libraryId, blockType, definitionId }) {
  const client = getAuthenticatedHttpClient();
  const response = await client.post(
    getCreateLibraryBlockUrl(libraryId),
    {
      block_type: blockType,
      definition_id: definitionId,
    },
  );

  return response.data;
}
