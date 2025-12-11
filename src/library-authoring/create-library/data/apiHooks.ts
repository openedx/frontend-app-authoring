import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { createLibraryV2, createLibraryRestore, getLibraryRestoreStatus } from './api';
import { libraryAuthoringQueryKeys } from '../../data/apiHooks';
import {
  CreateLibraryRestoreResponse,
  GetLibraryRestoreStatusResponse,
  libraryRestoreQueryKeys,
  LibraryRestoreStatus,
} from './restoreConstants';

/**
 * Hook that provides a "mutation" that can be used to create a new content library.
 */
export const useCreateLibraryV2 = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createLibraryV2,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: libraryAuthoringQueryKeys.contentLibraryList() });
    },
  });
};

/**
 * React Query hook to fetch restore status for a specific task
 *
 * @param taskId - The unique identifier of the restore task
 *
 * @example
 * ```tsx
 * const { data, isLoading, isError } = useGetLibraryRestoreStatus('task:456abc');
 * ```
 */
export const useGetLibraryRestoreStatus = (taskId: string) => useQuery<GetLibraryRestoreStatusResponse, Error>({
  queryKey: libraryRestoreQueryKeys.restoreStatus(taskId),
  queryFn: () => getLibraryRestoreStatus(taskId),
  enabled: !!taskId, // Only run the query if taskId is provided
  refetchInterval: (query) => (query.state.data?.state === LibraryRestoreStatus.Pending ? 2000 : false),
});

export const useCreateLibraryRestore = () => useMutation<CreateLibraryRestoreResponse, Error, File>({
  mutationKey: libraryRestoreQueryKeys.restoreMutation(),
  mutationFn: createLibraryRestore,
});
