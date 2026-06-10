import { useMutationState } from '@tanstack/react-query';
import { RequestStatus } from '@src/data/constants';
import { getErrorDetails } from '../utils/getErrorDetails';
import { courseOutlineQueryKeys } from './queryKeys';

/**
 * Aggregate save status across all saving mutations for a course.
 * Priority: pending > latest completed by submittedAt > idle => ''
 */
export function useCourseOutlineSavingStatus(courseId?: string): string {
  const mutations = useMutationState({
    filters: { mutationKey: courseOutlineQueryKeys.mutations.saving(courseId) },
  });
  // Pending wins
  const hasPending = mutations.some(m => m.status === 'pending');
  if (hasPending) { return RequestStatus.PENDING; }
  // Find latest by submittedAt among completed
  let latest: { status: 'success' | 'error'; submittedAt: number; } | null = null;
  for (const m of mutations) {
    if (m.status !== 'success' && m.status !== 'error') { continue; }
    const t = m.submittedAt ?? 0;
    if (t > 0 && (!latest || t > latest.submittedAt)) {
      latest = { status: m.status as 'success' | 'error', submittedAt: t };
    }
  }
  if (!latest) { return ''; }
  return latest.status === 'error' ? RequestStatus.FAILED : RequestStatus.SUCCESSFUL;
}

/**
 * Find the most recent (by submittedAt) mutation among a list.
 */
function latestMutation<T extends { submittedAt?: number; status?: string; }>(mutations: T[]): T | undefined {
  let latest: T | undefined;
  for (const m of mutations) {
    if (m.status !== 'success' && m.status !== 'error') { continue; }
    const t = m.submittedAt ?? 0;
    if (t > 0 && (!latest || (latest.submittedAt ?? 0) < t)) {
      latest = m;
    }
  }
  return latest;
}

/**
 * Derive reindex loading status and error from reindex mutations.
 */
export function useCourseOutlineReindexStatus(courseId?: string): {
  reindexLoadingStatus: string;
  reindexError: any;
} {
  const mutations = useMutationState({
    filters: { mutationKey: courseOutlineQueryKeys.mutations.reindex(courseId) },
  });

  // Pending wins — must check before latestMutation, which filters out 'pending'.
  // This ensures IN_PROGRESS is reported even when a previous mutation succeeded/failed
  // and a new reindex has been started (including retries after prior failure/success).
  if (mutations.some(m => m.status === 'pending')) {
    return { reindexLoadingStatus: RequestStatus.IN_PROGRESS, reindexError: null };
  }

  const latest = latestMutation(mutations);
  const status = latest?.status;
  if (status === 'error' && latest) {
    return {
      reindexLoadingStatus: RequestStatus.FAILED,
      reindexError: getErrorDetails(latest.error),
    };
  }
  if (status === 'success') {
    return { reindexLoadingStatus: RequestStatus.SUCCESSFUL, reindexError: null };
  }
  // idle / no mutations — preserve existing behavior (IN_PROGRESS)
  return { reindexLoadingStatus: RequestStatus.IN_PROGRESS, reindexError: null };
}
