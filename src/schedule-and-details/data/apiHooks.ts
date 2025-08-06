import { useQuery, useQueryClient } from '@tanstack/react-query';

import { getCourseDetails } from './api';

/**
 * Get the details of a course.
 */
export const useGetCourseDetails = (courseId?: string) => {
  const queryClient = useQueryClient();

  const {
    data, isLoading, isError, refetch,
  } = useQuery({
    queryKey: ['courseDetails', courseId],
    queryFn: () => getCourseDetails(courseId),
    refetchOnWindowFocus: false,
  });
  let globalDefaults: { [key: string]: any } | undefined;
  if (data === undefined && courseId) {
    // If course-specific waffle flags were requested, first default to the
    // global (studio-wide) flags until we've loaded the course-specific ones.
    globalDefaults = queryClient.getQueryData(['courseDetails', undefined]);
  }
  return {
    ...globalDefaults,
    ...data,
    id: courseId,
    isLoading,
    isError,
    refetch,
  };
};
