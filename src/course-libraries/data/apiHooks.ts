import {
  useQuery,
  useQueryClient,
  type Query,
  type QueryClient,
} from '@tanstack/react-query';
import { getEntityLinksByDownstreamContext } from './api';


export const courseLibrariesQueryKeys = {
  all: ['courseLibraries'],
  courseLibraries: (courseKey?: string) => [...courseLibrariesQueryKeys.all, courseKey],
}

/**
 * Hook to fetch a content library by its ID.
 */
export const useEntityLinksByDownstreamContext = (courseKey: string | undefined) => (
  useQuery({
    queryKey: courseLibrariesQueryKeys.courseLibraries(courseKey),
    queryFn: () => getEntityLinksByDownstreamContext(courseKey!),
    enabled: courseKey !== undefined,
  })
);
