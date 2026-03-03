/* eslint-disable import/no-extraneous-dependencies */
import { AxiosError } from 'axios';
import { skipToken, useMutation, useQuery } from '@tanstack/react-query';

import { getImportStatus, startCourseImporting, type ImportStatusData } from './api';

export const importQueryKeys = {
  all: ['courseImport'],
  /** Key for the import status of a specific file in a course */
  importStatus: (courseId: string, fileName: string) => [
    ...importQueryKeys.all,
    courseId,
    fileName,
  ],
};

interface StartCourseImportingProps {
  updateProgress: (percent: number) => void;
  fileData: File;
  requestConfig: Record<string, any>;
  handleError: (error: any) => void;
}

/**
 * Returns a mutation to start uploading and importing a course file.
 * Handles chunked file uploads and reports upload progress via `updateProgress`.
 */
export const useStartCourseImporting = (courseId: string) => (
  useMutation({
    mutationFn: ({ fileData, requestConfig, updateProgress }: StartCourseImportingProps) => (
      startCourseImporting(courseId, fileData, requestConfig, updateProgress)
    ),
    onError: (error, { handleError }) => handleError(error),
  })
);

/**
 * Polls the import status for a given file being imported into a course.
 * Only enabled when `fileName` is provided.
 */
export const useImportStatus = (
  courseId: string,
  stopRefetch: boolean,
  fileName?: string,
) => (
  useQuery<ImportStatusData, AxiosError>({
    queryKey: importQueryKeys.importStatus(courseId, fileName ?? ''),
    queryFn: fileName ? () => getImportStatus(courseId, fileName!) : skipToken,
    refetchInterval: (fileName && !stopRefetch) ? 3000 : false,
  })
);
