import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

function normalizeApps(data) {
  const apps = Object.entries(data.providers.available).map(([key, app]) => ({
    id: key,
    featureIds: app.features,
    hasFullSupport: app.features.length >= data.features.length,
  }));
  return {
    courseId: data.context_key,
    enabled: data.enabled,
    features: data.features.map(id => ({
      id,
    })),
    appConfig: data.plugin_configuration,
    activeAppId: data.providers.active,
    apps,
  };
}

// eslint-disable-next-line import/prefer-default-export
export async function getApps(courseId) {
  const { data } = await getAuthenticatedHttpClient()
    .get(`${getConfig().LMS_BASE_URL}/discussions/api/v0/${courseId}`);

  return normalizeApps(data);
}
