import { camelCaseObject, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

const getStudioBaseUrl = () => getConfig().STUDIO_BASE_URL as string;

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

export type WaffleFlagName = (
  | 'enableCourseOptimizer'
  | 'useNewAdvancedSettingsPage'
  | 'useNewCertificatesPage'
  | 'useNewCourseOutlinePage'
  | 'useNewCourseTeamPage'
  | 'useNewCustomPages'
  | 'useNewExportPage'
  | 'useNewFilesUploadsPage'
  | 'useNewGradingPage'
  | 'useNewGroupConfigurationsPage'
  | 'useNewHomePage'
  | 'useNewImportPage'
  | 'useNewScheduleDetailsPage'
  | 'useNewTextbooksPage'
  | 'useNewUnitPage'
  | 'useNewUpdatesPage'
  | 'useNewVideoUploadsPage'
  | 'useReactMarkdownEditor'
  | 'useVideoGalleryFlow'
);

/** The default values of waffle flags. helpful if you're overriding them for a test case. */
export const waffleFlagDefaults = {
  enableCourseOptimizer: false,
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
} satisfies Record<WaffleFlagName, boolean>;

export type WaffleFlagsStatus = { id: string | undefined } & Record<WaffleFlagName, boolean>;

export async function getWaffleFlags(courseId?: string): Promise<WaffleFlagsStatus> {
  const { data } = await getAuthenticatedHttpClient()
    .get(getApiWaffleFlagsUrl(courseId));
  return normalizeCourseDetail(data);
}
