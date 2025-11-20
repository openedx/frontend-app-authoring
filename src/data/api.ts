import { camelCaseObject, getConfig, snakeCaseObject } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

const getStudioBaseUrl = () => getConfig().STUDIO_BASE_URL as string;

/**
 * Get the URL to check the migration task status
 */
export const getModulestoreMigrationStatusUrl = (migrationId: string) => `${getStudioBaseUrl()}/api/modulestore_migrator/v1/migrations/${migrationId}/`;

/**
 * Get the URL for bulk migrate content to libraries
 */
export const bulkModulestoreMigrateUrl = () => `${getStudioBaseUrl()}/api/modulestore_migrator/v1/bulk_migration/`;

export const getApiWaffleFlagsUrl = (courseId?: string): string => {
  const baseUrl = getStudioBaseUrl();
  const apiPath = '/api/contentstore/v1/course_waffle_flags';

  return courseId ? `${baseUrl}${apiPath}/${courseId}` : `${baseUrl}${apiPath}`;
};

function normalizeCourseDetail(data) {
  return {
    id: data.course_id,
    ...camelCaseObject(data),
  };
}

export async function getCourseDetail(courseId: string, username: string) {
  const { data } = await getAuthenticatedHttpClient()
    .get(`${getConfig().LMS_BASE_URL}/api/courses/v1/courses/${courseId}?username=${username}`);

  return normalizeCourseDetail(data);
}

/**
 * The default values of waffle flags, used while we're loading the "real"
 * values from Studio's REST API, and/or if we fail to load them.
 * May drift from edx-platform's actual defaults!
 * TODO: clarify our strategy here: https://github.com/openedx/frontend-app-authoring/issues/2094
 */
export const waffleFlagDefaults = {
  enableCourseOptimizer: false,
  enableCourseOptimizerCheckPrevRunLinks: false,
  useNewHomePage: true,
  useNewCustomPages: true,
  useNewScheduleDetailsPage: true,
  useNewAdvancedSettingsPage: true,
  useNewGradingPage: true,
  useNewUpdatesPage: true,
  useNewImportPage: false,
  useNewExportPage: true,
  useNewFilesUploadsPage: true,
  useNewVideoUploadsPage: true,
  useNewCourseOutlinePage: true,
  useNewUnitPage: false,
  useNewCourseTeamPage: true,
  useNewCertificatesPage: true,
  useNewTextbooksPage: true,
  useNewGroupConfigurationsPage: true,
  useReactMarkdownEditor: true,
  useVideoGalleryFlow: false,
} as const;

export type WaffleFlagName = keyof typeof waffleFlagDefaults;

export type WaffleFlagsStatus = { id: string | undefined } & Record<WaffleFlagName, boolean>;

/**
 * Get Waffle Flags from Studio's REST API.
 * Don't use this directly; use the `useWaffleFlags()` hook.
 *
 * A `mockWaffleFlags()` method is available if you need to override this in
 * tests.
 *
 * @param courseId Get the flags for a specific course, which may be different
 *    than the system-wide flags.
 */
export async function getWaffleFlags(courseId?: string): Promise<WaffleFlagsStatus> {
  const { data } = await getAuthenticatedHttpClient()
    .get(getApiWaffleFlagsUrl(courseId));
  return normalizeCourseDetail(data);
}

export interface MigrateParameters {
  id: number;
  source: string;
  target: string;
  compositionLevel: string;
  repeatHandlingStrategy: 'update' | 'skip' | 'fork';
  preserveUrlSlugs: boolean;
  targetCollectionSlug: string;
  forwardSourceToTarget: boolean;
  isFailed: boolean;
  targetCollection: {
    key: string;
    title: string;
  } | null;
  migrationSummary: {
    totalBlocks: number;
    sections: number;
    subsections: number;
    units: number;
    components: number;
    unsupported: number;
  }
  unsupportedReasons: {
    block_name: string;
    block_type: string;
    reason: string;
  }[];
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
  parameters: MigrateParameters[];
}

export interface BulkMigrateRequestData {
  sources: string[];
  target: string;
  targetCollectionSlugList?: string[];
  createCollections?: boolean;
  compositionLevel?: string;
  repeatHandlingStrategy?: string;
  preserveUrlSlugs?: boolean;
  forwardSourceToTarget?: boolean;
}

/**
 * Get migration task status
 */
export async function getModulestoreMigrationStatus(
  migrationId: string,
): Promise<MigrateTaskStatusData> {
  const client = getAuthenticatedHttpClient();
  const { data } = await client.get(getModulestoreMigrationStatusUrl(migrationId));
  return camelCaseObject(data);
}

/**
 * Bulk migrate content to libraries
 */
export async function bulkModulestoreMigrate(
  requestData: BulkMigrateRequestData,
): Promise<MigrateTaskStatusData> {
  const client = getAuthenticatedHttpClient();
  const { data } = await client.post(bulkModulestoreMigrateUrl(), snakeCaseObject(requestData));
  return camelCaseObject(data);
}
