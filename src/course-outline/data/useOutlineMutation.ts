import { useQueryClient, type QueryClient } from '@tanstack/react-query';
import { useMutationWithProcessingNotification } from '@src/generic/processing-notification/data/apiHooks';
import { courseOutlineQueryKeys } from './queryKeys';
import { getCourseKey } from '@src/generic/key-utils';
import type { ParentIds } from '@src/generic/types';
import { invalidateOutlineAndParents } from './cacheInvalidation';

export interface OutlineMutationOptions<TVariables, TData> {
  operation: string;
  mutationFn: (variables: TVariables) => Promise<TData>;
  onSuccess?: (data: TData, variables: TVariables, queryClient: QueryClient) => void | Promise<void>;
  onSettled?: (
    data: TData | undefined,
    error: Error | null,
    variables: TVariables,
    queryClient: QueryClient,
  ) => void | Promise<void>;
}

/**
 * Factory hook for course-outline mutations.
 *
 * Derives mutation key from `courseOutlineQueryKeys.mutations.savingOperation(courseKey, operation)`
 * and wraps with `useMutationWithProcessingNotification`.
 *
 * Default `onSettled` calls `invalidateOutlineAndParents` to refresh parent queries + course details.
 * Provide custom `onSuccess`/`onSettled` (4th arg = queryClient) to extend or replace default behavior.
 * Pass `onSettled: () => {}` to suppress default parent invalidation.
 */
export function useOutlineMutation<TVariables, TData>(
  courseKey: string | undefined,
  options: OutlineMutationOptions<TVariables, TData>,
) {
  const queryClient = useQueryClient();

  /** Default onSettled: invalidate parent queries + course details. */
  const defaultOnSettled = (
    _data: TData | undefined,
    _error: Error | null,
    variables: TVariables,
  ) => {
    const vars = variables as any;
    const key = courseKey
      || (vars.itemId && getCourseKey(vars.itemId))
      || (vars.sectionId && getCourseKey(vars.sectionId))
      || (vars.subsectionId && getCourseKey(vars.subsectionId));
    if (key) {
      invalidateOutlineAndParents(queryClient, vars as ParentIds, key);
    }
  };

  return useMutationWithProcessingNotification({
    mutationKey: courseOutlineQueryKeys.mutations.savingOperation(courseKey, options.operation),
    mutationFn: options.mutationFn,
    onSuccess: options.onSuccess
      ? (data: TData, vars: TVariables) => options.onSuccess!(data, vars, queryClient)
      : undefined,
    onSettled: options.onSettled !== undefined
      ? (data: TData | undefined, err: Error | null, vars: TVariables) =>
        options.onSettled!(data, err, vars, queryClient)
      : defaultOnSettled,
  });
}
