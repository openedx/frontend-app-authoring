import {
  camelCaseObject,
  getConfig,
} from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

const getApiBaseUrl = () => getConfig().STUDIO_BASE_URL;
export const getProctoringErrorsApiUrl = () => `${getApiBaseUrl()}/api/contentstore/v1/proctoring_errors/`;

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
