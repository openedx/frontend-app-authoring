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

export const LIBRARY_BACKUP_MUTATION_KEY = 'create-library-backup';
