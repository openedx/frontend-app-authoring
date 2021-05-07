import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

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

function normalizePluginConfig(data) {
  if (!data || Object.keys(data).length < 1) {
    return {};
  }

  return {
    allowAnonymousPosts: data.allow_anonymous,
    allowAnonymousPostsPeers: data.allow_anonymous_to_peers,
    blackoutDates: JSON.stringify(data.discussion_blackouts),
    // TODO: We need all these added to the API.  ... default them for now
    divideByCohorts: false,
    allowDivisionByUnit: false,
    divideCourseWideTopics: false,
    // TODO: Note that these last two are in the `discussion_topics` data, but we haven't been able
    // to add them properly here yet.  I'm not sure the data is in a usable state as is, since it
    // only seems to include the topics for which these would be "true".  Assuming its only these
    // two, I think we could check for the existence of "General" for the first, but I'm not sure
    // what the topic title is for the second.  "Questions for TAs" maybe?
    divideGeneralTopic: false,
    divideQuestionsForTAsTopic: false,
    discussionTopics: Object.entries(data.discussion_topics).map(([key, value]) => (
      {
        name: key,
        id: value.id,
      }
    )),
  };
}

function normalizeApps(data) {
  const apps = Object.entries(data.providers.available).map(([key, appFeatures]) => ({
    id: key,
    featureIds: appFeatures,
    // TODO: Fix this and get it from the backend!
    documentationUrl: 'http://example.com',
    hasFullSupport: appFeatures.length >= data.features.length,
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
  divideQuestionsForTAsTopic
  */
  const pluginConfiguration = {};

  if (data.allowAnonymousPosts) {
    pluginConfiguration.allow_anonymous = data.allowAnonymousPosts;
  }
  if (data.allowAnonymousPostsPeers) {
    pluginConfiguration.allow_anonymous_to_peers = data.allowAnonymousPostsPeers;
  }
  if (data.blackoutDates) {
    pluginConfiguration.discussion_blackouts = JSON.parse(data.blackoutDates);
  }
  if (data.discussionTopics.length) {
    pluginConfiguration.discussion_topics = data.discussionTopics.reduce((topics, currentTopic) => {
      const newTopics = { ...topics };
      newTopics[currentTopic.name] = { id: currentTopic.id };
      return newTopics;
    }, {});
  }

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

  if (Object.keys(ltiConfiguration).length > 0) {
    // Only add this in if we're sending LTI fields.
    // TODO: Eventually support LTI v1.3 here.
    ltiConfiguration.version = 'lti_1p1';
  }

  return {
    context_key: courseId,
    enabled: true,
    lti_configuration: ltiConfiguration,
    plugin_configuration: pluginConfiguration,
    provider_type: appId,
  };
}

export function getAppsUrl(courseId) {
  return `${getConfig().LMS_BASE_URL}/discussions/api/v0/${courseId}`;
}

export async function getApps(courseId) {
  const { data } = await getAuthenticatedHttpClient()
    .get(getAppsUrl(courseId));

  return normalizeApps(data);
}

export async function postAppConfig(courseId, appId, values) {
  const { data } = await getAuthenticatedHttpClient().post(
    getAppsUrl(courseId),
    denormalizeData(courseId, appId, values),
  );

  return normalizeApps(data);
}
