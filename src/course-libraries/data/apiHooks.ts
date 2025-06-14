import {
  useQuery,
} from '@tanstack/react-query';
import { getContainerEntityLinks, getEntityLinks, getEntityLinksSummaryByDownstreamContext } from './api';

export const courseLibrariesQueryKeys = {
  all: ['courseLibraries'],
  courseLibraries: (courseId?: string) => [...courseLibrariesQueryKeys.all, courseId],
  courseReadyToSyncLibraries: ({
    courseId, readyToSync, upstreamUsageKey, upstreamContainerKey,
  }: {
    courseId?: string,
    readyToSync?: boolean,
    upstreamUsageKey?: string,
    upstreamContainerKey?: string,
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
    if (upstreamContainerKey !== undefined) {
      key.push(upstreamContainerKey);
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

/**
 * Hook to fetch list of publishable entity links for containers by course key.
 * (That is, get a list of the library containers used in the given course.)
 */
export const useContainerEntityLinks = ({
  courseId, readyToSync, upstreamContainerKey,
}: {
  courseId?: string,
  readyToSync?: boolean,
  upstreamContainerKey?: string,
}) => (
  useQuery({
    queryKey: courseLibrariesQueryKeys.courseReadyToSyncLibraries({
      courseId,
      readyToSync,
      upstreamContainerKey,
    }),
    queryFn: () => getContainerEntityLinks(
      courseId,
      readyToSync,
      upstreamContainerKey,
    ),
    enabled: courseId !== undefined || upstreamContainerKey !== undefined || readyToSync !== undefined,
  })
);
