// @ts-check
import { camelCaseObject, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import type { ContentLibrary } from './types';

const getApiBaseUrl = () => getConfig().STUDIO_BASE_URL;
/**
 * Get the URL for the content library API.
 */
export const getContentLibraryApiUrl = (libraryId: string) => `${getApiBaseUrl()}/api/libraries/v2/${libraryId}/`;

/**
 * Fetch a content library by its ID.
 */
export async function getContentLibrary(libraryId?: string): Promise<ContentLibrary> {
  if (!libraryId) {
    throw new Error('libraryId is required');
  }

  const { data } = await getAuthenticatedHttpClient().get(getContentLibraryApiUrl(libraryId));
  return camelCaseObject(data);
}
