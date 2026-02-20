/* eslint-disable import/no-extraneous-dependencies */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import {
  getCourseAdvancedSettings,
  getProctoringExamErrors,
  updateCourseAdvancedSettings,
} from './api';

export const advancedSettingsQueryKeys = {
  all: ['advancedSettings'],
  /** Base key for advanced settings specific to a courseId */
  courseAdvancedSettings: (courseId: string) => [...advancedSettingsQueryKeys.all, courseId],
  /** Key for proctoring exam errors specific to a courseId */
  proctoringExamErrors: (courseId: string) => [...advancedSettingsQueryKeys.all, courseId, 'proctoringErrors'],
};

const sortSettingsByDisplayName = (settings: Record<string, any>): Record<string, any> => {
  const sortedDisplayName: string[] = [];
  Object.values(settings).forEach(value => {
    const { displayName }: { displayName: string } = value;
    sortedDisplayName.push(displayName);
  });
  const sortedSettingValues = {};
  sortedDisplayName.sort((a, b) => a.localeCompare(b)).forEach((displayName => {
    Object.entries(settings).forEach(([key, value]) => {
      if (value.displayName === displayName) {
        sortedSettingValues[key] = value;
      }
    });
  }));
  return sortedSettingValues;
};

/**
 * Fetches the advanced settings for a course, sorted alphabetically by display name.
 */
export const useCourseAdvancedSettings = (courseId: string) => (
  useQuery<Record<string, any>, AxiosError>({
    queryKey: advancedSettingsQueryKeys.courseAdvancedSettings(courseId),
    queryFn: () => getCourseAdvancedSettings(courseId),
    select: sortSettingsByDisplayName,
  })
);

/**
 * Fetches the proctoring exam errors for a course.
 */
export const useProctoringExamErrors = (courseId: string) => (
  useQuery({
    queryKey: advancedSettingsQueryKeys.proctoringExamErrors(courseId),
    queryFn: () => getProctoringExamErrors(courseId),
  })
);

/**
 * Returns a mutation to update the advanced settings for a course.
 */
export const useUpdateCourseAdvancedSettings = (courseId: string) => {
  const queryClient = useQueryClient();
  return useMutation<Record<string, any>, AxiosError, Record<string, any>>({
    mutationFn: (settings: Record<string, any>) => updateCourseAdvancedSettings(courseId, settings),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: advancedSettingsQueryKeys.courseAdvancedSettings(courseId) });
    },
  });
};
