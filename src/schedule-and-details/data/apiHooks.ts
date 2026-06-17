/* eslint-disable import/no-extraneous-dependencies */
import { AxiosError } from 'axios';
import {
  useMutation,
  useQuery,
  useQueryClient,
  skipToken,
} from '@tanstack/react-query';

import * as api from './api';

export const scheduleAndDetailsQueryKeys = {
  all: ['scheduleAndDetails'],
  courseDetails: (courseId?: string) => [...scheduleAndDetailsQueryKeys.all, courseId],
};

/**
 * Hook to fetch course details for a given course ID.
 */
export const useCourseDetails = (courseId?: string) => (
  useQuery<api.CourseDetails, AxiosError>({
    queryKey: scheduleAndDetailsQueryKeys.courseDetails(courseId),
    queryFn: courseId ? () => api.getCourseDetails(courseId) : skipToken,
  })
);

/**
 * Hook that provides a mutation to update course details.
 */
export const useUpdateCourseDetails = (courseId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (details: api.CourseDetails) => api.updateCourseDetails(courseId, details),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scheduleAndDetailsQueryKeys.courseDetails(courseId) });
    },
  });
};
