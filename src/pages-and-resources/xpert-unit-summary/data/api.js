import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

export function getXpertSettingsUrl(courseId) {
  return `${getConfig().STUDIO_BASE_URL}/ai_aside/v1/${courseId}`;
}

export function getXpertConfigurationStatusUrl(courseId) {
  return `${getConfig().STUDIO_BASE_URL}/ai_aside/v1/${courseId}/configurable`;
}

export async function getXpertSettings(courseId) {
  const { data } = await getAuthenticatedHttpClient()
    .get(getXpertSettingsUrl(courseId));

  return data;
}

export async function postXpertSettings(courseId, state) {
  const { data } = await getAuthenticatedHttpClient()
    .post(getXpertSettingsUrl(courseId), {
      enabled: state.enabled,
    });

  return data;
}

export async function getXpertPluginConfigurable(courseId) {
  const { data } = await getAuthenticatedHttpClient()
    .get(getXpertConfigurationStatusUrl(courseId));

  return data;
}
