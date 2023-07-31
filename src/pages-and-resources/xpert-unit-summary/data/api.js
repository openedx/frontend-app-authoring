import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

export function getXpertSettingsUrl(courseId) {
  return `${getConfig().LMS_BASE_URL}/ai_aside/v1/${courseId}`;
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
