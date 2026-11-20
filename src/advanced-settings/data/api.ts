import {
  camelCaseObject,
  getConfig,
} from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import type { AxiosError } from 'axios';
import { camelCase } from 'lodash';
import { convertObjectToSnakeCase } from '@src/utils';

const getApiBaseUrl = () => getConfig().STUDIO_BASE_URL;
export const getCourseAdvancedSettingsApiUrl = (courseId: string) =>
  `${getApiBaseUrl()}/api/authoring/v1/courses/${courseId}/advanced_settings/`;
export const getProctoringErrorsApiUrl = () => `${getApiBaseUrl()}/api/contentstore/v1/proctoring_errors/`;

/**
 * Get's advanced setting for a course.
 */
export async function getCourseAdvancedSettings(courseId: string): Promise<Record<string, any>> {
  const { data } = await getAuthenticatedHttpClient()
    .get(getCourseAdvancedSettingsApiUrl(courseId));
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
    .patch(getCourseAdvancedSettingsApiUrl(courseId), convertObjectToSnakeCase(settings));
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

export interface AdvancedSettingError {
  key: string;
  message: string;
}

/**
 * Lists the settings a failed update refused, one entry per setting, from the
 * `errors` member of the error body (`{setting_name: [message, ...]}`).
 * An error tied to no setting comes under `non_field_errors`; a failure without `errors` gives an empty list.
 */
export function getAdvancedSettingsErrors(error: unknown): AdvancedSettingError[] {
  const errors = (error as AxiosError<{ errors?: Record<string, string[]>; }>)?.response?.data?.errors;
  if (!errors || typeof errors !== 'object') {
    return [];
  }
  return Object.entries(errors).map(([key, messages]) => ({
    key,
    message: ([] as string[]).concat(messages).join(' '),
  }));
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
