export interface CreateLibraryRestoreResponse {
  task_id: string;
}

export interface LibraryRestoreResult {
  learning_package_id: number;
  title: string;
  org: string;
  slug: string;
  key: string;
  archive_key: string;
  containers: number;
  components: number;
  collections: number;
  sections: number;
  subsections: number;
  units: number;
  created_on_server: string;
  created_at: string;
  created_by: {
    username: string;
    email: string;
  };
}

export interface GetLibraryRestoreStatusResponse {
  state: LibraryRestoreStatus;
  result: LibraryRestoreResult | null;
  error: string | null;
  error_log: string | null;
}

export enum LibraryRestoreStatus {
  Pending = 'Pending',
  Succeeded = 'Succeeded',
  Failed = 'Failed',
}

export const libraryRestoreQueryKeys = {
  all: ['library-v2-restore'],
  restoreStatus: (taskId: string) => [...libraryRestoreQueryKeys.all, 'status', taskId],
  restoreMutation: () => [...libraryRestoreQueryKeys.all, 'create-restore'],
};

export const VALID_ARCHIVE_EXTENSIONS = ['.zip', '.tar.gz', '.tar'];
export const DROPZONE_ACCEPT_TYPES = {
  'application/zip': ['.zip'],
  'application/gzip': ['.tar.gz'],
  'application/x-tar': ['.tar'],
};
