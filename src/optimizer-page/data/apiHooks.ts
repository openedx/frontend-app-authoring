import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
  type QueryKey,
} from '@tanstack/react-query';

import {
  getLinkCheckStatus,
  getRerunLinkUpdateStatus,
  postLinkCheck,
  postRerunLinkUpdateAll,
  postRerunLinkUpdateSingle,
  type LinkCheckStatusApiResponseBody,
  type RerunLinkUpdateStatusApiResponseBody,
} from './api';
import {
  LINK_CHECK_IN_PROGRESS_STATUSES,
  RERUN_LINK_UPDATE_IN_PROGRESS_STATUSES,
  RERUN_LINK_UPDATE_STATUSES,
  LinkCheckStatusTypes,
  type RerunLinkUpdateStatus,
} from './constants';
import type { LinkCheckResult } from '../types';

const POLLING_INTERVAL = 2000;

export const courseOptimizerQueryKeys = {
  all: ['courseOptimizer'] as const satisfies QueryKey,
  linkCheckStatus: (courseId: string) => ['courseOptimizer', 'linkCheckStatus', courseId] as const,
  rerunLinkUpdateStatus: (courseId: string) => ['courseOptimizer', 'rerunLinkUpdateStatus', courseId] as const,
};

export interface LinkCheckStatusData {
  linkCheckStatus: LinkCheckStatusTypes | null;
  linkCheckOutput: LinkCheckResult | null;
  linkCheckCreatedAt: string | null;
}

export interface RerunLinkUpdateResult {
  id: string;
  success: boolean;
  newUrl: string | null;
  originalUrl: string | null;
  type: string;
}

export interface RerunLinkUpdateStatusData {
  status: RerunLinkUpdateStatus | null;
  results: RerunLinkUpdateResult[];
}

export interface UpdatePreviousRunLinkVariables {
  linkUrl: string;
  blockId: string;
  contentType?: string;
}

interface StatusQueryOptions {
  enabled?: boolean;
  polling?: boolean;
  manualPolling?: boolean;
}

const normalizeLinkCheckStatus = (response: LinkCheckStatusApiResponseBody): LinkCheckStatusData => ({
  linkCheckStatus: response.linkCheckStatus ?? null,
  linkCheckOutput: response.linkCheckOutput ?? null,
  linkCheckCreatedAt: response.linkCheckCreatedAt ?? null,
});

const normalizeRerunLinkUpdateStatus = (
  response: RerunLinkUpdateStatusApiResponseBody,
): RerunLinkUpdateStatusData => ({
  status: response.status === 'uninitiated'
    ? RERUN_LINK_UPDATE_STATUSES.UNINITIATED
    : response.status ?? null,
  results: (response.results ?? []).map(result => ({
    id: result.id,
    success: result.success,
    newUrl: result.newUrl ?? null,
    originalUrl: result.originalUrl ?? null,
    type: result.type,
  })),
});

const isLinkCheckInProgress = (status: LinkCheckStatusTypes | null | undefined) => (
  status !== undefined && status !== null && LINK_CHECK_IN_PROGRESS_STATUSES.includes(status)
);

const fetchRerunLinkUpdateStatus = (courseId: string) => (
  getRerunLinkUpdateStatus(courseId).then(normalizeRerunLinkUpdateStatus)
);

/** Restore the pre-mutation cache entry, or drop the optimistic entry when there was none. */
const rollbackOptimisticQuery = (
  queryClient: QueryClient,
  queryKey: QueryKey,
  previous: unknown,
) => {
  if (previous !== undefined) {
    queryClient.setQueryData(queryKey, previous);
  } else {
    queryClient.removeQueries({ queryKey });
  }
};

export const useLinkCheckStatus = (courseId: string, options: StatusQueryOptions = {}) => (
  useQuery({
    queryKey: courseOptimizerQueryKeys.linkCheckStatus(courseId),
    queryFn: () => getLinkCheckStatus(courseId).then(normalizeLinkCheckStatus),
    enabled: Boolean(courseId) && options.enabled !== false,
    refetchInterval: query => (
      options.polling || isLinkCheckInProgress(query.state.data?.linkCheckStatus) ? POLLING_INTERVAL : false
    ),
    staleTime: 0,
    retry: false,
  })
);

export const useRerunLinkUpdateStatus = (courseId: string, options: StatusQueryOptions = {}) => (
  useQuery({
    queryKey: courseOptimizerQueryKeys.rerunLinkUpdateStatus(courseId),
    queryFn: () => fetchRerunLinkUpdateStatus(courseId),
    enabled: Boolean(courseId) && options.enabled !== false,
    // Server status drives this interval so remounts recover; manual single-link polling suppresses it to avoid duplicate GETs.
    refetchInterval: query => {
      if (options.manualPolling || query.state.error) {
        return false;
      }
      const status = query.state.data?.status;
      return status != null && RERUN_LINK_UPDATE_IN_PROGRESS_STATUSES.includes(status)
        ? POLLING_INTERVAL
        : false;
    },
    staleTime: 0,
    retry: false,
  })
);

export const useStartLinkCheck = (courseId: string) => {
  const queryClient = useQueryClient();
  const queryKey = courseOptimizerQueryKeys.linkCheckStatus(courseId);

  return useMutation({
    mutationFn: () => postLinkCheck(courseId),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<LinkCheckStatusData>(queryKey);
      queryClient.setQueryData<LinkCheckStatusData>(queryKey, {
        linkCheckStatus: LinkCheckStatusTypes.PENDING,
        linkCheckOutput: null,
        linkCheckCreatedAt: null,
      });
      return { previous };
    },
    onError: (_error, _variables, context) => {
      rollbackOptimisticQuery(queryClient, queryKey, context?.previous);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
    retry: false,
  });
};

// Both rerun mutations invalidate because no operation ID/version correlates reruns with terminal payloads;
// bulk polling refetches active queries, while single-link polling marks this query stale for its manual loop.
const pendingRerunStatus: RerunLinkUpdateStatusData = {
  status: RERUN_LINK_UPDATE_STATUSES.PENDING,
  results: [],
};

export const useUpdateAllPreviousRunLinks = (courseId: string) => {
  const queryClient = useQueryClient();
  const queryKey = courseOptimizerQueryKeys.rerunLinkUpdateStatus(courseId);

  return useMutation({
    mutationFn: () => postRerunLinkUpdateAll(courseId),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<RerunLinkUpdateStatusData>(queryKey);
      queryClient.setQueryData(queryKey, pendingRerunStatus);
      return { previous };
    },
    onError: (_error, _variables, context) => {
      rollbackOptimisticQuery(queryClient, queryKey, context?.previous);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
    retry: false,
  });
};

export const useUpdateSinglePreviousRunLink = (courseId: string) => {
  const queryClient = useQueryClient();
  const queryKey = courseOptimizerQueryKeys.rerunLinkUpdateStatus(courseId);

  return useMutation({
    mutationFn: ({ linkUrl, blockId, contentType }: UpdatePreviousRunLinkVariables) => (
      postRerunLinkUpdateSingle(courseId, linkUrl, blockId, contentType)
    ),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<RerunLinkUpdateStatusData>(queryKey);
      queryClient.setQueryData(queryKey, pendingRerunStatus);
      return { previous };
    },
    onError: (_error, _variables, context) => {
      rollbackOptimisticQuery(queryClient, queryKey, context?.previous);
    },
    // Keep the cache stale without stealing the manual single-link loop's GET ownership.
    onSuccess: () => queryClient.invalidateQueries({ queryKey, refetchType: 'none' }),
    retry: false,
  });
};
