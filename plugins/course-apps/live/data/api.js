import { ensureConfig, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { bbbPlanTypes } from '../constants';

ensureConfig([
  'STUDIO_BASE_URL',
], 'Course Apps API service');

const apiBaseUrl = getConfig().STUDIO_BASE_URL;

export const providersApiUrl = `${apiBaseUrl}/api/course_live/providers`;
export const providerConfigurationApiUrl = `${apiBaseUrl}/api/course_live/course`;

function normalizeProviders(data) {
  const apps = Object.entries(data.providers.available).map(([key, app]) => ({
    id: key,
    featureIds: app.features,
    name: app.name,
    piiSharing: app.pii_sharing,
    hasFreeTier: app.has_free_tier,
  }));

  return {
    activeAppId: data.providers.active,
    selectedAppId: data.providers.active,
    apps,
  };
}

function normalizeLtiConfig(data) {
  if (!data || Object.keys(data).length < 1) {
    return {};
  }

  return {
    consumerKey: data.lti_1p1_client_key,
    consumerSecret: data.lti_1p1_client_secret,
    launchUrl: data.lti_1p1_launch_url,
    launchEmail: data.lti_config?.additional_parameters?.custom_instructor_email,
    tierType: data.tierType,
  };
}

export function normalizeSettings(data) {
  let tier;
  if (data.provider_type === 'big_blue_button') {
    tier = data.free_tier === true ? bbbPlanTypes.free : bbbPlanTypes.commercial;
  }
  return {
    enabled: data.enabled,
    piiSharingAllowed: data.pii_sharing_allowed,
    appConfig: {
      id: data.provider_type,
      ...normalizeLtiConfig({ ...data.lti_configuration, tierType: tier }),
    },
  };
}

export function deNormalizeSettings(data) {
  const ltiConfiguration = {};
  if (data.consumerKey) {
    ltiConfiguration.lti_1p1_client_key = data.consumerKey;
  }
  if (data.consumerSecret) {
    ltiConfiguration.lti_1p1_client_secret = data.consumerSecret;
  }
  if (data.launchUrl) {
    ltiConfiguration.lti_1p1_launch_url = data.launchUrl;
  }
  if (data?.provider === 'zoom' || data.tierType !== 'Free') {
    ltiConfiguration.lti_config = {};
    if (data.launchEmail) {
      ltiConfiguration.lti_config.additional_parameters = {
        custom_instructor_email: data.launchEmail,
      };
    }
  }
  if (Object.keys(ltiConfiguration).length > 0) {
    // Only add this in if we're sending LTI fields.
    // TODO: Eventually support LTI v1.3 here.
    ltiConfiguration.version = 'lti_1p1';
  }

  const apiData = {
    enabled: data?.enabled || false,
    lti_configuration: Object.keys(ltiConfiguration).length ? ltiConfiguration : undefined,
    provider_type: data?.provider || 'zoom',
    pii_sharing_allowed: data?.piiSharingEnable || false,
    free_tier: data?.provider === 'zoom' ? false : Boolean(data.tierType === 'Free'),
  };
  return apiData;
}

/**
 * Fetches providers for provided course
 * @param {string} courseId
 * @returns {Promise<[{}]>}
 */
export async function getLiveProviders(courseId) {
  const { data } = await getAuthenticatedHttpClient()
    .get(`${providersApiUrl}/${courseId}/`);

  return normalizeProviders(data);
}

/**
 * Fetches provider settings for provided course
 * @param {string} courseId
 * @returns {Promise<[{}]>}
 */
export async function getLiveConfiguration(courseId) {
  const { data } = await getAuthenticatedHttpClient()
    .get(`${providerConfigurationApiUrl}/${courseId}/`);
  return normalizeSettings(data);
}

export async function postLiveConfiguration(courseId, config) {
  const { data } = await getAuthenticatedHttpClient().post(
    `${providerConfigurationApiUrl}/${courseId}/`,
    deNormalizeSettings(config),
  );
  return normalizeSettings(data);
}
