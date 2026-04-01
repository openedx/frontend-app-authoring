/* eslint-disable import/no-extraneous-dependencies */
import { AxiosError } from 'axios';
import { useQueryClient, skipToken, useMutation, useQuery } from '@tanstack/react-query';

import { getExportStatus, startCourseExporting, type ExportStatusData } from './api';

export const exportQueryKeys = {
  all: ['courseExport'],
  /** Key for the export status of a specific course */
  exportStatus: (courseId: string) => [...exportQueryKeys.all, courseId],
};

/**
 * Returns a function to invalidate the export status query for a given course.
 */
export const useInvalidateExportStatus = (courseId: string) => {
  const queryClient = useQueryClient();
  return () => queryClient.removeQueries({ queryKey: exportQueryKeys.exportStatus(courseId) });
};

/**
 * Returns a mutation to start exporting a course.
 */
export const useStartCourseExporting = (courseId: string) =>
  useMutation({
    mutationFn: () => startCourseExporting(courseId),
  });

/**
 * Get the export status for a given course.
 * Only fetch while `stopRefetch` is false.
 */
export const useExportStatus = (courseId: string, stopRefetch: boolean, enabled: boolean) =>
  useQuery<ExportStatusData, AxiosError>({
    queryKey: exportQueryKeys.exportStatus(courseId),
    queryFn: enabled ? () => getExportStatus(courseId) : skipToken,
    refetchInterval: enabled && !stopRefetch ? 3000 : false,
  });
