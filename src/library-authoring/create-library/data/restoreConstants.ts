export interface CreateLibraryRestoreResponse {
  taskId: string;
}

export interface LibraryRestoreResult {
  learningPackageId: number;
  title: string;
  org: string;
  slug: string;
  key: string;
  archiveKey: string;
  containers: number;
  components: number;
  collections: number;
  sections: number;
  subsections: number;
  units: number;
  createdOnServer: string;
  createdAt: string;
  createdBy: {
    username: string;
    email: string;
  };
}

export interface GetLibraryRestoreStatusResponse {
  state: LibraryRestoreStatus;
  result: LibraryRestoreResult | null;
  error: string | null;
  errorLog: string | null;
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

export const VALID_ARCHIVE_EXTENSIONS = ['.zip'];
export const DROPZONE_ACCEPT_TYPES = {
  'application/zip': ['.zip'],
};
