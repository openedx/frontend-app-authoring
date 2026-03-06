import { useQuery } from '@tanstack/react-query';
import { getCourseDetails } from './api';

/**
 * Get the details of a course.
 */
export const useGetCourseDetails = (courseId?: string) => {
  const {
    data, isLoading, isError, refetch, dataUpdatedAt
  } = useQuery({
    queryKey: ['courseDetails', courseId],
    queryFn: () => getCourseDetails(courseId),
    enabled: !!courseId,
    refetchOnWindowFocus: false,
  });
  return {
    ...data,
    id: courseId,
    isLoading,
    isError,
    refetch,
	dataUpdatedAt,
  };
};
