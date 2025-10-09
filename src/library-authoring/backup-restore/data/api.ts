import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { CreateLibraryBackupResponse, GetLibraryBackupStatusResponse } from '@src/library-authoring/backup-restore/data/constants';

const getApiUrl = (path: string) => `${getConfig().STUDIO_BASE_URL}/${path || ''}`;

export const createLibraryBackup = async (libraryId: string): Promise<CreateLibraryBackupResponse> => {
  const { data } = await getAuthenticatedHttpClient().post(getApiUrl(`api/libraries/v2/${libraryId}/backup/`));
  return data;
};

export const getLibraryBackupStatus = async (libraryId: string, taskId: string):
Promise<GetLibraryBackupStatusResponse> => {
  const { data } = await getAuthenticatedHttpClient().get(getApiUrl(`api/libraries/v2/${libraryId}/backup/?task_id=${taskId}`));
  return data;
};
