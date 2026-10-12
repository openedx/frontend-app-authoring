import {
  camelCaseObject,
  getConfig,
} from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { camelCase } from 'lodash';
import { convertObjectToSnakeCase } from '@src/utils';

const getApiBaseUrl = () => getConfig().STUDIO_BASE_URL;
export const getCourseAdvancedSettingsApiUrl = (courseId) =>
  `${getApiBaseUrl()}/api/contentstore/v0/advanced_settings/${courseId}`;
export const getProctoringErrorsApiUrl = () => `${getApiBaseUrl()}/api/contentstore/v1/proctoring_errors/`;

/**
 * Get's advanced setting for a course.
 */
export async function getCourseAdvancedSettings(courseId: string): Promise<Record<string, any>> {
  const { data } = await getAuthenticatedHttpClient()
    .get(`${getCourseAdvancedSettingsApiUrl(courseId)}?fetch_all=0`);
  const keepValues = {};
  Object.keys(data).forEach((key) => {
    keepValues[camelCase(key)] = { value: data[key].value };
  });
  const formattedData = {};
  const formattedCamelCaseData = camelCaseObject(data);
  Object.keys(formattedCamelCaseData).forEach((key) => {
    formattedData[key] = {
      ...formattedCamelCaseData[key],
      value: keepValues[key]?.value,
    };
  });
  return formattedData;
}

/**
 * Updates advanced setting for a course.
 */
export async function updateCourseAdvancedSettings(
  courseId: string,
  settings: Record<string, any>,
): Promise<Record<string, any>> {
  const { data } = await getAuthenticatedHttpClient()
    .patch(`${getCourseAdvancedSettingsApiUrl(courseId)}`, convertObjectToSnakeCase(settings));
  const keepValues = {};
  Object.keys(data).forEach((key) => {
    keepValues[camelCase(key)] = { value: data[key].value };
  });
  const formattedData = {};
  const formattedCamelCaseData = camelCaseObject(data);
  Object.keys(formattedCamelCaseData).forEach((key) => {
    formattedData[key] = {
      ...formattedCamelCaseData[key],
      value: keepValues[key]?.value,
    };
  });
  return formattedData;
}

export interface ProctoringExamErrors {
  mfeProctoredExamSettingsUrl: string;
  proctoringErrors: {
    key: string;
    message: string;
    model: Record<string, any>;
  }[];
}

/**
 * Gets proctoring exam errors and the link to the proctored exam settings page.
 */
export async function getProctoringExamErrors(courseId: string): Promise<ProctoringExamErrors> {
  const { data } = await getAuthenticatedHttpClient().get(`${getProctoringErrorsApiUrl()}${courseId}`);
  return camelCaseObject(data);
}
