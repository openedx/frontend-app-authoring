import {
  useQuery,
} from '@tanstack/react-query';
import { getEntityLinks, getEntityLinksSummaryByDownstreamContext } from './api';

export const courseLibrariesQueryKeys = {
  all: ['courseLibraries'],
  courseLibraries: (courseId?: string) => [...courseLibrariesQueryKeys.all, courseId],
  courseReadyToSyncLibraries: ({ courseId, readyToSync, upstreamUsageKey }: {
    courseId?: string,
    readyToSync?: boolean,
    upstreamUsageKey?: string,
    pageSize?: number,
  }) => {
    const key: Array<string | boolean | number> = [...courseLibrariesQueryKeys.all];
    if (courseId !== undefined) {
      key.push(courseId);
    }
    if (readyToSync !== undefined) {
      key.push(readyToSync);
    }
    if (upstreamUsageKey !== undefined) {
      key.push(upstreamUsageKey);
    }
    return key;
  },
  courseLibrariesSummary: (courseId?: string) => [...courseLibrariesQueryKeys.courseLibraries(courseId), 'summary'],
};

/**
 * Hook to fetch list of publishable entity links by course key.
 * (That is, get a list of the library components used in the given course.)
 */
export const useEntityLinks = ({
  courseId, readyToSync, upstreamUsageKey,
}: {
  courseId?: string,
  readyToSync?: boolean,
  upstreamUsageKey?: string,
}) => (
  useQuery({
    queryKey: courseLibrariesQueryKeys.courseReadyToSyncLibraries({
      courseId,
      readyToSync,
      upstreamUsageKey,
    }),
    queryFn: () => getEntityLinks(
      courseId,
      readyToSync,
      upstreamUsageKey,
    ),
    enabled: courseId !== undefined || upstreamUsageKey !== undefined || readyToSync !== undefined,
  })
);

/**
 * Hook to fetch publishable entity links summary by course key.
 */
export const useEntityLinksSummaryByDownstreamContext = (courseId?: string) => (
  useQuery({
    queryKey: courseLibrariesQueryKeys.courseLibrariesSummary(courseId),
    queryFn: () => getEntityLinksSummaryByDownstreamContext(courseId!),
    enabled: courseId !== undefined,
  })
);
