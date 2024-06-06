// @ts-check
import type { ContentLibrary } from './types';
import { camelCaseObject, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

const getApiBaseUrl = (): string => getConfig().STUDIO_BASE_URL;
const getContentLibraryApiUrl = (libraryId: string) => `${getApiBaseUrl()}/api/libraries/v2/${libraryId}/`;

export async function getContentLibrary(libraryId: string): Promise<ContentLibrary> {
  const { data } = await getAuthenticatedHttpClient().get(getContentLibraryApiUrl(libraryId));
  return camelCaseObject(data);
}
