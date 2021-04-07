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
    // TODO: Defaulting to "legacy" should come from the backend.  For now this makes sense as we
    // don't create a DiscussionsConfiguration object in the backend for legacy discussions, which
    // is configured by default on all courses.  The endpoint doesn't know this and returns a null
    // for `active`, which we can then interpret as "the user hasn't configured something else" and
    // choose to fall back to legacy.  In the long run, we should be able to trust `active` to give
    // us 'legacy' if the legacy experience is being used.
    activeAppId: data.providers.active || 'legacy',
    apps,
  };
}

// eslint-disable-next-line import/prefer-default-export
export async function getApps(courseId) {
  const { data } = await getAuthenticatedHttpClient()
    .get(`${getConfig().LMS_BASE_URL}/discussions/api/v0/${courseId}`);

  return normalizeApps(data);
}
