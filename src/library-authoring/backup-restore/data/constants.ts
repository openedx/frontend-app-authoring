export interface CreateLibraryBackupResponse {
  task_id: string;
}

export interface GetLibraryBackupStatusResponse {
  state: LibraryBackupStatus;
  url: string;
}

export enum LibraryBackupStatus {
  Pending = 'Pending',
  Succeeded = 'Succeeded',
  Exporting = 'Exporting',
  Failed = 'Failed',
}

export const libraryBackupQueryKeys = {
  // TODO: add appId to follow new agreements once definitions are ready for queryKeys
  all: ['library-v2-backup'],
  backupStatus: (libraryId: string, taskId: string) => [...libraryBackupQueryKeys.all, 'status', libraryId, taskId],
  backupMutation: (libraryId: string) => [...libraryBackupQueryKeys.all, 'create-backup', libraryId],
};
