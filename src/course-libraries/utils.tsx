import { type QueryClient } from '@tanstack/react-query';
import { courseLibrariesQueryKeys } from './data/apiHooks';

/**
 * Ivalidates the downstream links query for a course
 */
export const invalidateLinksQuery = (queryClient: QueryClient, courseId: string) => {
  queryClient.invalidateQueries({
    queryKey: courseLibrariesQueryKeys.courseLibraries(courseId),
  });
};
