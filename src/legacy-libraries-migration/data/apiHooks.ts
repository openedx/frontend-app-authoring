import { skipToken, useMutation, useQuery } from '@tanstack/react-query';

import * as api from './api';

export const legacyMigrationQueryKeys = {
  all: ['contentLibrary'],
  /**
   * Base key for data specific to a migration task
   */
  migrationTask: (migrationId?: string | null) => [...legacyMigrationQueryKeys.all, migrationId],
};

/**
 * Use this mutation to update container collections
 */
export const useUpdateContainerCollections = () => (
  useMutation({
    mutationFn: async (requestData: api.BulkMigrateRequestData) => api.bulkMigrateLegacyLibraries(requestData),
  })
);

/**
 * Get the migration status
 */
export const useMigrationStatus = (migrationId: string | null) => (
  useQuery({
    queryKey: legacyMigrationQueryKeys.migrationTask(migrationId),
    queryFn: migrationId ? () => api.getMigrationStatus(migrationId!) : skipToken,
    refetchInterval: 1000, // Refresh every second
  })
);
