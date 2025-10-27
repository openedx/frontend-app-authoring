import { camelCaseObject, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import type { ContentLibrary } from '../../data/api';
import { CreateLibraryRestoreResponse, GetLibraryRestoreStatusResponse } from './restoreConstants';
import { getLibraryRestoreApiUrl, getLibraryRestoreStatusApiUrl } from '../../data/api';

const getApiBaseUrl = () => getConfig().STUDIO_BASE_URL;

/**
 * Get the URL for creating a new library.
 */
export const getContentLibraryV2CreateApiUrl = () => `${getApiBaseUrl()}/api/libraries/v2/`;

export interface CreateContentLibraryArgs {
  title: string,
  org: string,
  slug: string,
  learning_package?: number,
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

export const createLibraryRestore = async (archiveFile: File): Promise<CreateLibraryRestoreResponse> => {
  const formData = new FormData();
  formData.append('file', archiveFile);

  const { data } = await getAuthenticatedHttpClient().post(getLibraryRestoreApiUrl(), formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return data;
};

export const getLibraryRestoreStatus = async (taskId: string): Promise<GetLibraryRestoreStatusResponse> => {
  const { data } = await getAuthenticatedHttpClient().get(getLibraryRestoreStatusApiUrl(taskId));
  return data;
};
