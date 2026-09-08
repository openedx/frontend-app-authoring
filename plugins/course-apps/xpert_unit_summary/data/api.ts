import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

export function getXpertSettingsUrl(courseId: string) {
  return `${getConfig().STUDIO_BASE_URL}/ai_aside/v1/${courseId}`;
}

export function getXpertConfigurationStatusUrl(courseId: string) {
  return `${getConfig().STUDIO_BASE_URL}/ai_aside/v1/${courseId}/configurable`;
}

export interface XpertSettings {
  enabled?: boolean;
  success?: boolean;
}

export interface XpertSettingsState {
  enabled: boolean;
  reset?: boolean;
}

export interface XpertResponse {
  response: {
    success: boolean;
  };
}

export async function getXpertSettings(courseId: string): Promise<XpertSettings> {
  const { data } = await getAuthenticatedHttpClient()
    .get(getXpertSettingsUrl(courseId));

  return data.response;
}

export async function postXpertSettings(courseId: string, state: XpertSettingsState): Promise<XpertResponse> {
  const { data } = await getAuthenticatedHttpClient()
    .post(getXpertSettingsUrl(courseId), {
      enabled: state.enabled,
      reset: state.reset || false,
    });

  return data;
}

export async function deleteXpertSettings(courseId: string): Promise<XpertResponse> {
  const { data } = await getAuthenticatedHttpClient()
    .delete(getXpertSettingsUrl(courseId));

  return data;
}
