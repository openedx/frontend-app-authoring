import { camelCaseObject, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import type { ContentLibrary } from '../../data/api';

const getApiBaseUrl = () => getConfig().STUDIO_BASE_URL;

/**
 * Get the URL for creating a new library.
 */
export const getContentLibraryV2CreateApiUrl = () => `${getApiBaseUrl()}/api/libraries/v2/`;

export interface CreateContentLibraryArgs {
  title: string,
  org: string,
  slug: string,
}

/**
 * Create a new library
 */
export async function createLibraryV2(data: CreateContentLibraryArgs): Promise<ContentLibrary> {
  const client = getAuthenticatedHttpClient();
  const url = getContentLibraryV2CreateApiUrl();

  // Description field cannot be null, but we don't have a input in the form for it
  const { data: newLibrary } = await client.post(url, { description: '', ...data });

  return camelCaseObject(newLibrary);
}
