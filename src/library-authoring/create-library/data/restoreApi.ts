import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { CreateLibraryRestoreResponse, GetLibraryRestoreStatusResponse } from './restoreConstants';
import { getLibraryRestoreApiUrl, getLibraryRestoreStatusApiUrl } from '../../data/api';

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
