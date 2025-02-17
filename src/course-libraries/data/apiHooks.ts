import {
  useQuery,
} from '@tanstack/react-query';
import { getEntityLinksByDownstreamContext } from './api';

export const courseLibrariesQueryKeys = {
  all: ['courseLibraries'],
  courseLibraries: (courseKey?: string) => {
    return [...courseLibrariesQueryKeys.all, courseKey]
  },
  courseReadyToSyncLibraries: (courseKey?: string, readyToSync?: boolean) => {
    return [...courseLibrariesQueryKeys.courseLibraries(courseKey), readyToSync]
  },
};

/**
 * Hook to fetch a content library by its ID.
 */
export const useEntityLinksByDownstreamContext = (courseKey?: string, readyToSync?: boolean) => (
  useQuery({
    queryKey: courseLibrariesQueryKeys.courseReadyToSyncLibraries(courseKey, readyToSync),
    queryFn: () => getEntityLinksByDownstreamContext(courseKey!, readyToSync),
    enabled: courseKey !== undefined,
  })
);
