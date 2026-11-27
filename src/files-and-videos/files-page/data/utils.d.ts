import type React from 'react';

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

interface FilePreviewFields {
  thumbnail?: string | null;
  wrapperType: string;
  contentType?: string | null;
  externalUrl?: string | null;
}

export declare function hasImagePreview(file: FilePreviewFields): boolean;

export declare function getSrc(file: FilePreviewFields): string | React.ComponentType;

export declare function getUploadConflicts(
  filesToUpload: File[],
  assets: { displayName: string; }[],
): [Record<string, File>, File[]];
