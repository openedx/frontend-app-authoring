/* eslint-disable import/no-extraneous-dependencies */
import { useQuery } from '@tanstack/react-query';
import { advancedSettingsQueryKeys } from '@src/data/apiHooks';
import { getProctoringExamErrors } from './api';

/**
 * Nested under the course's advanced settings key, so that saving the settings
 * also invalidates the proctoring errors.
 */
const proctoringExamErrorsQueryKey = (courseId: string) => [
  ...advancedSettingsQueryKeys.courseAdvancedSettings(courseId),
  'proctoringErrors',
];

/**
 * Fetches the proctoring exam errors for a course.
 */
export const useProctoringExamErrors = (courseId: string) => (
  useQuery({
    queryKey: proctoringExamErrorsQueryKey(courseId),
    queryFn: () => getProctoringExamErrors(courseId),
  })
);
