import { camelCaseObject, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { convertObjectToSnakeCase } from '@src/utils';

const getApiBaseUrl = () => getConfig().STUDIO_BASE_URL;
// FC-0118 (ADR 0037): standardized v3 endpoint. The trailing slash is required
// by the DRF DefaultRouter that serves the v3 ViewSet (unlike the v1 APIView).
export const getCourseDetailsApiUrl = (courseId) =>
  `${getApiBaseUrl()}/api/contentstore/v3/course_details/${courseId}/`;
export const getUploadAssetsUrl = (courseId) => `${getApiBaseUrl()}/assets/${courseId}/`;

// TODO: This interface has only basic data, all the rest needs to be added.
export interface CourseDetails {
  courseId: string;
  run: string;
  title: string;
  subtitle?: string;
  org: string;
  description?: string;
  hasChanges: boolean;
  selfPaced: boolean;
  overview: string;
  aboutSidebarHtml: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

/**
 * Get course details.
 * TODO: This API call is also done in `course-outline`,
 * and a similar one is also done in `CourseAuthoringContext`.
 * We need to find a way to unify them.
 */
export async function getCourseDetails(courseId: string): Promise<CourseDetails> {
  const { data } = await getAuthenticatedHttpClient().get(
    `${getCourseDetailsApiUrl(courseId)}`,
  );
  return camelCaseObject(data);
}

/**
 * Update course details.
 */
export async function updateCourseDetails(
  courseId: string,
  details: CourseDetails,
): Promise<CourseDetails> {
  const { data } = await getAuthenticatedHttpClient().put(
    `${getCourseDetailsApiUrl(courseId)}`,
    convertObjectToSnakeCase(details, true),
  );
  return camelCaseObject(data);
}
