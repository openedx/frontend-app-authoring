import { createLibraryBackup, getLibraryBackupStatus } from '@src/library-authoring/backup-restore/data/api';
import { GetLibraryBackupStatusResponse, LIBRARY_BACKUP_MUTATION_KEY } from '@src/library-authoring/backup-restore/data/constants';
import { useMutation, useQuery } from '@tanstack/react-query';

/**
 * React Query hook to fetch backup status for a specific library and taskId
 * the taskID is returned when creating a backup
 *
 * @param libraryId - The unique identifier of the library
 * @param taskId - The unique identifier of the backup task
 *
 * @example
 * ```tsx
 * const { data, isLoading, isError } = useGetLibraryBackupStatus('lib:123', 'task:456abc');
 * ```
 */
export const useGetLibraryBackupStatus = (libraryId: string, taskId: string) => useQuery<GetLibraryBackupStatusResponse,
Error>({
  queryKey: ['library-backup-status', libraryId, taskId],
  queryFn: () => getLibraryBackupStatus(libraryId, taskId),
  enabled: !!taskId, // Only run the query if taskId is provided
  refetchInterval: (data) => (data?.state === 'Pending' || data?.state === 'Exporting' ? 2000 : false),
});

export const useCreateLibraryBackup = (libraryId: string) => useMutation({
  mutationKey: [LIBRARY_BACKUP_MUTATION_KEY, libraryId],
  mutationFn: () => createLibraryBackup(libraryId),
  cacheTime: 60, // Cache for 1 minute to prevent rapid re-creation of backups
});
