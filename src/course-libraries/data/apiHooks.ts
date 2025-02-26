import {
  useInfiniteQuery,
  useQuery,
} from '@tanstack/react-query';
import { getEntityLinksByDownstreamContext, getEntityLinksSummaryByDownstreamContext } from './api';

export const courseLibrariesQueryKeys = {
  all: ['courseLibraries'],
  courseLibraries: (courseKey?: string) => {
    return [...courseLibrariesQueryKeys.all, courseKey]
  },
  courseReadyToSyncLibraries: (courseKey?: string, readyToSync?: boolean) => {
    return [...courseLibrariesQueryKeys.courseLibraries(courseKey), readyToSync]
  },
  courseLibrariesSummary: (courseKey?: string) => {
    return [...courseLibrariesQueryKeys.courseLibraries(courseKey), "summary"]
  },
};

/**
 * Hook to fetch publishable entity links by course key.
 */
export const useEntityLinksByDownstreamContext = (courseKey?: string, readyToSync?: boolean, pageSize?: number) => (
  useInfiniteQuery({
    queryKey: courseLibrariesQueryKeys.courseReadyToSyncLibraries(courseKey, readyToSync),
    queryFn: ({ pageParam }) => getEntityLinksByDownstreamContext(
      courseKey,
      readyToSync,
      pageParam,
      pageSize
    ),
    getNextPageParam: (lastPage) => lastPage.next,
    enabled: courseKey !== undefined,
  })
);

/**
 * Hook to fetch publishable entity links summary by course key.
 */
export const useEntityLinksSummaryByDownstreamContext = (courseKey?: string) => (
  useQuery({
    queryKey: courseLibrariesQueryKeys.courseLibrariesSummary(courseKey),
    queryFn: () => getEntityLinksSummaryByDownstreamContext(courseKey!),
    enabled: courseKey !== undefined,
  })
);
