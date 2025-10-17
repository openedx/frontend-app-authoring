import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { CreateLibraryBackupResponse, GetLibraryBackupStatusResponse } from '@src/library-authoring/backup-restore/data/constants';
import { getLibraryBackupApiUrl, getLibraryBackupStatusApiUrl } from '@src/library-authoring/data/api';

export const createLibraryBackup = async (libraryId: string): Promise<CreateLibraryBackupResponse> => {
  const { data } = await getAuthenticatedHttpClient().post(getLibraryBackupApiUrl(libraryId), {});
  return data;
};

export const getLibraryBackupStatus = async (libraryId: string, taskId: string):
Promise<GetLibraryBackupStatusResponse> => {
  const { data } = await getAuthenticatedHttpClient().get(getLibraryBackupStatusApiUrl(libraryId, taskId));
  return data;
};
