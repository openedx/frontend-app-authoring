/* eslint-disable import/prefer-default-export */
import { camelCaseObject, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

const getApiBaseUrl = () => getConfig().STUDIO_BASE_URL;
export const postImportCourseApiUrl = (courseId) => `${getApiBaseUrl()}/import/${courseId}`;
export const getImportStatusApiUrl = (courseId, fileName) => `${getApiBaseUrl()}/import_status/${courseId}/${fileName}`;

/**
 * Start import course.
 * @param {string} courseId
 * @param {Object} fileData
 * @param {Object} requestConfig
 * @returns {Promise<Object>}
 */
export async function startCourseImporting(courseId, fileData, requestConfig) {
  const { data } = await getAuthenticatedHttpClient()
    .post(postImportCourseApiUrl(courseId), { 'course-data': fileData }, { headers: { 'content-type': 'multipart/form-data' }, ...requestConfig });
  return camelCaseObject(data);
}

/**
 * Get import status.
 * @param {string} courseId
 * @param {string} fileName
 * @returns {Promise<Object>}
 */
export async function getImportStatus(courseId, fileName) {
  const { data } = await getAuthenticatedHttpClient()
    .get(getImportStatusApiUrl(courseId, fileName));
  return camelCaseObject(data);
}
