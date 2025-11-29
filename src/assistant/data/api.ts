import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getConfig, camelCaseObject } from '@edx/frontend-platform';

import { GenerateAiContentReqI, GenerateAiContentResI } from '../types';

const getApiBaseUrl = () => getConfig()?.LMS_BASE_URL || '';

export const generateAiContent = async (
  payload: GenerateAiContentReqI,
): Promise<GenerateAiContentResI> => {
  const client = getAuthenticatedHttpClient();
  const { data } = await client.post(
    `${getApiBaseUrl()}/oex_ai_content_assistant/api/ai-content/generate/`,
    payload,
  );
  return camelCaseObject(data);
};
