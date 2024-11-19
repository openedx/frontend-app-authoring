import { camelCaseObject, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

const getApiBaseUrl = () => getConfig().STUDIO_BASE_URL;
export const postExportCourseApiUrl = (courseId) => new URL(`export/${courseId}`, getApiBaseUrl()).href;
export const getExportStatusApiUrl = (courseId) => new URL(`export_status/${courseId}`, getApiBaseUrl()).href;

export async function startCourseExporting(courseId) {
  const { data } = await getAuthenticatedHttpClient()
    .post(postExportCourseApiUrl(courseId));
  return camelCaseObject(data);
}

export async function getExportStatus(courseId) {
  const { data } = await getAuthenticatedHttpClient()
    .get(getExportStatusApiUrl(courseId));
  return camelCaseObject(data);
}
