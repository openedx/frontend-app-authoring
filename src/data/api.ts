import { camelCaseObject, getConfig, snakeCaseObject } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

const getStudioBaseUrl = () => getConfig().STUDIO_BASE_URL as string;
export const getCourseDetailsUrl = (courseId: string, username: string) => (
  `${getConfig().LMS_BASE_URL}/api/courses/v1/courses/${courseId}?username=${username}`
);

export type CourseDetailsData = {
  blocksUrl: string;
  courseId: string;
  effort?: string;
  end?: string;
  enrollmentEnd?: string;
  enrollmentStart?: string;
  hidden: boolean;
  id: string;
  invitationOnly: boolean;
  isEnrolled: boolean;
  media: Record<
  'image' | 'course_image' | 'banner_image' | 'course_video',
  Record<string, string | null>
  >;
  mobileAvailable: boolean;
  name: string;
  number: string;
  org: string;
  overview: string;
  pacing: string;
  shortDescription?: string;
  start?: string;
  startDisplay?: string;
  startType?: string;
};

/**
 * Get the URL to check the migration task status
 */
export const getModulestoreMigrationStatusUrl = (migrationId: string) => `${getStudioBaseUrl()}/api/modulestore_migrator/v1/migrations/${migrationId}/`;

/**
 * Get the URL for bulk migrate content to libraries
 */
export const bulkModulestoreMigrateUrl = () => `${getStudioBaseUrl()}/api/modulestore_migrator/v1/bulk_migration/`;

/**
 * Get the url for the API endpoint to get preview migration
 */
export const getPreviewModulestoreMigrationUrl = () => `${getStudioBaseUrl()}/api/modulestore_migrator/v1/migration_preview/`;

export const getApiWaffleFlagsUrl = (courseId?: string): string => {
  const baseUrl = getStudioBaseUrl();
  const apiPath = '/api/contentstore/v1/course_waffle_flags';

  return courseId ? `${baseUrl}${apiPath}/${courseId}` : `${baseUrl}${apiPath}`;
};

export async function getCourseDetails(courseId: string, username: string): Promise<CourseDetailsData> {
  const { data } = await getAuthenticatedHttpClient()
    .get(getCourseDetailsUrl(courseId, username));
  return {
    id: data.course_id,
    ...camelCaseObject(data),
  };
}

/**
 * The default values of waffle flags, used while we're loading the "real"
 * values from Studio's REST API, and/or if we fail to load them.
 * May drift from edx-platform's actual defaults!
 * TODO: clarify our strategy here: https://github.com/openedx/frontend-app-authoring/issues/2094
 */
export const waffleFlagDefaults = {
  enableCourseOptimizer: false,
  enableNotifications: false,
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
  enableAuthzCourseAuthoring: false,
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
  return {
    id: data.course_id,
    ...camelCaseObject(data),
  };
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

export interface PreviewMigrationInfo {
  state: 'partial' | 'success' | 'block_limit_reached';
  unsupportedBlocks: number;
  unsupportedPercentage: number;
  blocksLimit: number;
  totalBlocks: number;
  totalComponents: number;
  sections: number;
  subsections: number;
  units: number;
}

/**
 * Get the preview for a modulestore migration given a source key and a library key
 */
export async function getPreviewModulestoreMigration(
  libraryKey: string,
  sourceKey: string,
): Promise<PreviewMigrationInfo> {
  const client = getAuthenticatedHttpClient();

  const params = new URLSearchParams();
  params.append('target_key', libraryKey);
  params.append('source_key', sourceKey);

  const { data } = await client.get(getPreviewModulestoreMigrationUrl(), { params });
  return camelCaseObject(data);
}

export const getUserAgreementRecordApi = (agreementType: string) => `${getConfig().LMS_BASE_URL}/api/agreements/v1/agreement_record/${agreementType}`;

export async function getUserAgreementRecord(agreementType: string) {
  const client = getAuthenticatedHttpClient();
  const { data } = await client.get(getUserAgreementRecordApi(agreementType));
  return camelCaseObject(data);
}

export async function updateUserAgreementRecord(agreementType: string) {
  const client = getAuthenticatedHttpClient();
  const { data } = await client.post(getUserAgreementRecordApi(agreementType));
  return camelCaseObject(data);
}

export const getUserAgreementApi = (agreementType: string) => `${getConfig().LMS_BASE_URL}/api/agreements/v1/agreement/${agreementType}/`;

export async function getUserAgreement(agreementType: string) {
  const client = getAuthenticatedHttpClient();
  const { data } = await client.get(getUserAgreementApi(agreementType));
  return camelCaseObject(data);
}
