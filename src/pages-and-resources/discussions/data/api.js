import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

function normalizeLtiConfig(data) {
  if (!data) {
    return {};
  }

  return {
    consumerKey: data.lti_1p1_client_key,
    consumerSecret: data.lti_1p1_client_secret,
    launchUrl: data.lti_1p1_launch_url,
  };
}

function normalizePluginConfig(data) {
  if (!data) {
    return {};
  }

  return {
    allowAnonymousPosts: data.allow_anonymous,
    allowAnonymousPostsPeers: data.allow_anonymous_to_peers,
    blackoutDates: JSON.stringify(data.discussion_blackouts),
    // TODO: Get everything else we need... default them for now
    divideByCohorts: false,
    allowDivisionByUnit: false,
    divideCourseWideTopics: false,
    divideGeneralTopic: false,
    divideQuestionsForTAs: false,
  };
}

function normalizeApps(data) {
  const apps = Object.entries(data.providers.available).map(([key, app]) => ({
    id: key,
    featureIds: app.features,
    // TODO: Fix this and get it from the backend!
    documentationUrl: 'http://example.com',
    hasFullSupport: app.features.length >= data.features.length,
  }));
  return {
    courseId: data.context_key,
    enabled: data.enabled,
    features: data.features.map(id => ({
      id,
    })),
    appConfig: {
      id: data.providers.active,
      ...normalizePluginConfig(data.plugin_configuration),
      ...normalizeLtiConfig(data.lti_configuration),
    },
    activeAppId: data.providers.active,
    apps,
  };
}

function denormalizeData(courseId, appId, data) {
  /*
  TODO: What about these?  Some are from the instructor dashboard, presumably... but I don't think they all are.

  divideByCohorts
  allowDivisionByUnit
  divideCourseWideTopics
  divideGeneralTopic
  divideQuestionsForTAs
  */
  return {
    context_key: courseId,
    enabled: true,
    lti_configuration: {
      lti_1p1_client_key: data.consumerKey,
      lti_1p1_client_secret: data.consumerSecret,
      lti_1p1_launch_url: data.launchUrl,
      version: 'lti_1p1',
    },
    plugin_configuration: {
      allow_anonymous: data.allowAnonymousPosts,
      allow_anonymous_to_peers: data.allowAnonymousPostsPeers,
      discussion_blackouts: data.blackoutDates,
      discussion_link: '', // TODO: What is this?
      discussion_sort_alpha: '', // TODO: What is this?
      discussion_topics: '', // TODO: What is this?
    },
    provider_type: appId,
  };
}

export async function getApps(courseId) {
  const { data } = await getAuthenticatedHttpClient()
    .get(`${getConfig().LMS_BASE_URL}/discussions/api/v0/${courseId}`);

  return normalizeApps(data);
}

export async function postAppConfig(courseId, appId, values) {
  const { data } = await getAuthenticatedHttpClient()
    .post(`${getConfig().LMS_BASE_URL}/discussions/api/v0/${courseId}`, denormalizeData(courseId, appId, values));

  return normalizeApps(data);
}
