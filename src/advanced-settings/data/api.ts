import {
  camelCaseObject,
  getConfig,
} from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { camelCase } from 'lodash';

const getApiBaseUrl = () => getConfig().STUDIO_BASE_URL;
const getProctoringErrorsApiUrl = () => `${getApiBaseUrl()}/api/contentstore/v1/proctoring_errors/`;

/**
 * Gets proctoring exam errors.
 */
export async function getProctoringExamErrors(courseId: string): Promise<Record<string, any>> {
  const { data } = await getAuthenticatedHttpClient().get(`${getProctoringErrorsApiUrl()}${courseId}`);
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
