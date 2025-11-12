import { skipToken, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getWaffleFlags,
  waffleFlagDefaults,
  bulkMigrateLegacyLibraries,
  getMigrationStatus,
  BulkMigrateRequestData,
} from './api';

export const migrationQueryKeys = {
  all: ['contentLibrary'],
  /**
   * Base key for data specific to a migration task
   */
  migrationTask: (migrationId?: string | null) => [...migrationQueryKeys.all, migrationId],
};

/**
 * Get the waffle flags (which enable/disable specific features). They may
 * depend on which course we're in.
 */
export const useWaffleFlags = (courseId?: string) => {
  const queryClient = useQueryClient();

  const { data, isPending: isLoading, isError } = useQuery({
    queryKey: ['waffleFlags', courseId],
    queryFn: () => getWaffleFlags(courseId),
    // Waffle flags change rarely, so never bother refetching them:
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });
  let globalDefaults: typeof waffleFlagDefaults | undefined;
  if (data === undefined && courseId) {
    // If course-specific waffle flags were requested, first default to the
    // global (studio-wide) flags until we've loaded the course-specific ones.
    globalDefaults = queryClient.getQueryData(['waffleFlags', undefined]);
  }
  return {
    ...waffleFlagDefaults,
    ...globalDefaults, // Only used if we're requesting course-specific flags.
    ...data, // the actual flag values loaded from the server
    id: courseId,
    isLoading,
    isError,
  };
};

/**
 * Use this mutation to update container collections
 */
export const useUpdateContainerCollections = () => (
  useMutation({
    mutationFn: async (requestData: BulkMigrateRequestData) => bulkMigrateLegacyLibraries(requestData),
  })
);

/**
 * Get the migration status
 */
export const useMigrationStatus = (migrationId: string | null) => (
  useQuery({
    queryKey: migrationQueryKeys.migrationTask(migrationId),
    queryFn: migrationId ? () => getMigrationStatus(migrationId!) : skipToken,
    refetchInterval: 1000, // Refresh every second
  })
);
