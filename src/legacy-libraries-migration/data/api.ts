import { camelCaseObject, getConfig, snakeCaseObject } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

const getApiBaseUrl = () => getConfig().STUDIO_BASE_URL;

/**
 * Get the URL to check the migration task status
 */
export const getMigrationStatusUrl = (migrationId: string) => `${getApiBaseUrl()}/api/modulestore_migrator/v1/migrations/${migrationId}/`;

/**
 * Get the URL for bulk migrate legacy libraries
 */
export const bulkMigrateLegacyLibrariesUrl = () => `${getApiBaseUrl()}/api/modulestore_migrator/v1/bulk_migration/`;

export interface MigrateArtifacts {
  source: string;
  target: string;
  compositionLevel: string;
  repeatHandlingStrategy: string;
  preserveUrlSlugs: boolean;
  targetCollectionSlug: string;
  forwardSourceToTarget: boolean;
}

export interface MigrateTaskStatusData {
  state: string;
  stateText: string;
  completedSteps: number;
  totalSteps: number;
  attempts: number;
  created: string;
  modified: string;
  artifacts: string[];
  uuid: string;
  parameters: MigrateArtifacts[];
}

export interface BulkMigrateRequestData {
  sources: string[];
  target: string;
  target_collection_slug_list?: string[];
  create_collections?: boolean;
  composition_level?: string;
  repeat_handling_strategy?: string;
  preserve_url_slugs?: boolean;
  forward_source_to_target?: boolean;
}

/**
 * Get migration task status
 */
export async function getMigrationStatus(
  migrationId: string,
): Promise<MigrateTaskStatusData> {
  const client = getAuthenticatedHttpClient();
  const { data } = await client.get(getMigrationStatusUrl(migrationId));
  return camelCaseObject(data);
}

/**
 * Bulk migrate legacy libraries
 */
export async function bulkMigrateLegacyLibraries(
  requestData: BulkMigrateRequestData,
): Promise<MigrateTaskStatusData> {
  const client = getAuthenticatedHttpClient();
  const { data } = await client.post(bulkMigrateLegacyLibrariesUrl(), snakeCaseObject(requestData));
  return camelCaseObject(data);
}
