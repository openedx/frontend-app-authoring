import { ensureConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

ensureConfig([
  'STUDIO_BASE_URL',
], 'Course Apps API service');

function normalizeLtiConfig(data) {
  if (!data || Object.keys(data).length < 1) {
    return {};
  }

  return {
    consumerKey: data.lti_1p1_client_key,
    consumerSecret: data.lti_1p1_client_secret,
    launchUrl: data.lti_1p1_launch_url,
  };
}

function normalizePiiSharing(data) {
  return {
    piiSharing: data.pii_sharing_allowed,
    piiShareUsername: data.pii_sharing_allowed,
    piiShareEmail: data.pii_sharing_allowed,
  };
}

function normalizeAppConfig(data) {
  return {
    id: data.provider_type,
    ...normalizeLtiConfig(data.lti_configuration),
  };
}

function normalizeProviders(data) {
  const apps = Object.entries(data.available).map(([key, app]) => ({
    id: key,
    messages: app.messages,
    externalLinks: {
      learnMore: app.external_links.learn_more,
      configuration: app.external_links.configuration,
      general: app.external_links.general,
      accessibility: app.external_links.accessibility,
      contactEmail: app.external_links.contact_email,
    },
    adminOnlyConfig: !!app.admin_only_config,
  }));
  return {
    activeAppId: data.active,
    apps,
  };
}

function normalizeSettings(data) {
  return {
    appConfig: normalizeAppConfig(data),
    piiConfig: normalizePiiSharing(data.lti_configuration),
  };
}

function denormalizeData(courseId, appId, data) {
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
  if (data.launchEmail) {
    ltiConfiguration.lti_1p1_launch_email = data.launchEmail;
  }
  if ('piiShareUsername' in data) {
    ltiConfiguration.pii_share_username = data.piiShareUsername;
  }
  if ('piiShareEmail' in data) {
    ltiConfiguration.pii_share_email = data.piiShareEmail;
  }

  if (Object.keys(ltiConfiguration).length > 0) {
    // Only add this in if we're sending LTI fields.
    // TODO: Eventually support LTI v1.3 here.
    ltiConfiguration.version = 'lti_1p1';
  }

  const apiData = {
    context_key: courseId,
    enabled: true,
    lti_configuration: ltiConfiguration,
    provider_type: appId,
  };

  return apiData;
}

export function getLiveProvidersUrl() {
  // return `${getConfig().STUDIO_BASE_URL}/api/live/v0/course/${courseId}/providers`;
}

export function getLiveSettingsUrl() {
  // return `${getConfig().STUDIO_BASE_URL}/api/live/v0/course/${courseId}/settings`;
}

export async function getLiveProviders() {
  // const { data } = await getAuthenticatedHttpClient()
  //   .get(getLiveProvidersUrl(courseId));

  const data = {
    active: 'zoom',
    available: {
      zoom: {
        admin_only_config: true,
        external_links: {
          accessibility: '',
          configuration: '',
          contact_email: '',
          general: 'https://edstem.org/us/',
          learn_more: '',
        },
        messages: [
          'Schedule meetings with Zoom to conduct live course sessions with learners',
        ],
        supports_lti: true,
      },
    },
  };
  return normalizeProviders(data);
}

export async function getLiveSettings(courseId, providerId = null) {
  const params = {};
  if (providerId) {
    params.params = { provider_id: providerId };
  }
  // const url = getLiveSettingsUrl(courseId);
  // const { data } = await getAuthenticatedHttpClient()
  //   .get(url, params);
  const data = {
    enabled: true,
    lti_configuration: {
      lti_1p1_client_key: '',
      lti_1p1_client_secret: '',
      lti_1p1_launch_url: '',
      pii_share_email: true,
      pii_share_username: true,
      pii_sharing_allowed: true,
      version: null,
    },
    provider_type: 'zoom',
  };

  return normalizeSettings(data);
}

export async function postLiveSettings(courseId, appId, values) {
  const { data } = await getAuthenticatedHttpClient().post(
    getLiveSettingsUrl(courseId),
    denormalizeData(courseId, appId, values),
  );

  return normalizeSettings(data);
}
