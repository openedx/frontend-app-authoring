import { useMutation, useQuery } from '@tanstack/react-query';
import { createLibraryRestore, getLibraryRestoreStatus } from './restoreApi';
import {
  CreateLibraryRestoreResponse,
  GetLibraryRestoreStatusResponse,
  libraryRestoreQueryKeys,
  LibraryRestoreStatus,
} from './restoreConstants';

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
