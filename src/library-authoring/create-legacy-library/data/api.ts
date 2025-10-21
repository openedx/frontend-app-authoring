import { camelCaseObject, snakeCaseObject, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import type { LibraryV1Data } from '@src/studio-home/data/api';

/**
 * Get the URL for creating a new library.
 */
export const getContentLibraryV1CreateApiUrl = () => `${getConfig().STUDIO_BASE_URL}/library/`;

export interface CreateContentLibraryV1Args {
  displayName: string,
  org: string,
  number: string,
}

/**
 * Create a new library
 */
export async function createLibraryV1(data: CreateContentLibraryV1Args): Promise<LibraryV1Data> {
  const client = getAuthenticatedHttpClient();
  const url = getContentLibraryV1CreateApiUrl();

  const { data: newLibrary } = await client.post(url, { ...snakeCaseObject(data) });

  return camelCaseObject(newLibrary);
}
