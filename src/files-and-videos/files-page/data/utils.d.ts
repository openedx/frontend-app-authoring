export interface RawFile {
  id: string;
  displayName: string;
  contentType: string;
  dateAdded: string;
  locked: boolean;
  thumbnail?: string | null;
  externalUrl?: string;
  usageLocations: unknown[];
  [key: string]: unknown;
}

export interface UpdatedFile extends Omit<RawFile, 'dateAdded'> {
  wrapperType: string;
  lockStatus: string;
  activeStatus: string;
  dateAdded: number;
}

export declare function updateFileValues(files: RawFile[]): UpdatedFile[];

export declare function getSrc(file: {
  thumbnail?: string | null;
  wrapperType: string;
  externalUrl?: string;
}): string;

export declare function getUploadConflicts(
  filesToUpload: File[],
  assets: { displayName: string }[]
): [Record<string, File>, File[]];