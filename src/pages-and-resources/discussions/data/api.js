import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import _ from 'lodash';
import moment from 'moment';
import { v4 as uuid } from 'uuid';

import { checkStatus, sortBlackoutDatesByStatus, formatDate } from '../app-config-form/utils';
import { blackoutDatesStatus as constants } from './constants';

function normalizeLtiConfig(data) {
  if (!data || Object.keys(data).length < 1) {
    return {};
  }

  return {
    consumerKey: data.lti_1p1_client_key,
    consumerSecret: data.lti_1p1_client_secret,
    launchUrl: data.lti_1p1_launch_url,
    piiSharing: 'pii_share_username' in data || 'pii_share_email' in data,
    piiShareUsername: data.pii_share_username,
    piiShareEmail: data.pii_share_email,
  };
}

function normalizeDiscussionTopic(data) {
  return Object.entries(data).map(([key, value]) => (
    {
      name: key,
      id: value.id,
    }
  ));
}

function extractDiscussionTopicIds(data) {
  return Object.entries(
    data,
    // eslint-disable-next-line no-unused-vars
  ).map(([key, value]) => value.id);
}

function normalizeBlackoutDates(data) {
  const normaizeData = data.map(([startDate, endDate]) => ({
    id: uuid(),
    startDate: moment(startDate).format('YYYY-MM-DD'),
    startTime: startDate.split('T')[1] || '',
    endDate: moment(endDate).format('YYYY-MM-DD'),
    endTime: endDate.split('T')[1] || '',
    status: checkStatus([startDate, endDate]),
  }));

  return [
    ...sortBlackoutDatesByStatus(normaizeData, constants.ACTIVE, 'desc'),
    ...sortBlackoutDatesByStatus(normaizeData, constants.UPCOMING, 'asc'),
    ...sortBlackoutDatesByStatus(normaizeData, constants.COMPLETE, 'desc'),
  ];
}

function normalizePluginConfig(data) {
  if (!data || Object.keys(data).length < 1) {
    return {};
  }
  const discussionDividedTopicsCount = _.size(data.divided_course_wide_discussions);
  const discussionTopicsCount = _.size(data.discussion_topics);
  const enableDivideCourseTopicsByCohorts = (
    discussionDividedTopicsCount && discussionDividedTopicsCount !== discussionTopicsCount
  );
  return {
    allowAnonymousPosts: data.allow_anonymous,
    allowAnonymousPostsPeers: data.allow_anonymous_to_peers,
    blackoutDates: normalizeBlackoutDates(data.discussion_blackouts),
    allowDivisionByUnit: false,
    divideByCohorts: discussionDividedTopicsCount > 0,
    divideCourseTopicsByCohorts: enableDivideCourseTopicsByCohorts,
  };
}

function normalizeApps(data) {
  const apps = Object.entries(data.providers.available).map(([key, app]) => ({
    id: key,
    messages: app.messages,
    featureIds: app.features,
    externalLinks: {
      learnMore: app.external_links.learn_more,
      configuration: app.external_links.configuration,
      general: app.external_links.general,
      accessibility: app.external_links.accessibility,
      contactEmail: app.external_links.contact_email,
    },
    hasFullSupport: app.has_full_support,
    adminOnlyConfig: !!app.admin_only_config,
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
    discussionTopicIds: data.plugin_configuration.discussion_topics
      ? extractDiscussionTopicIds(data.plugin_configuration.discussion_topics) : [],
    discussionTopics: data.plugin_configuration.discussion_topics
      ? normalizeDiscussionTopic(data.plugin_configuration.discussion_topics) : [],
    divideDiscussionIds: data.plugin_configuration.divided_course_wide_discussions,
  };
}

export function denormalizeBlackoutDate(date) {
  return [
    formatDate(date.startDate, date.startTime),
    formatDate(date.endDate, date.endDate),
  ];
}

function denormalizeData(courseId, appId, data) {
  const pluginConfiguration = {};

  if (data.allowAnonymousPosts) {
    pluginConfiguration.allow_anonymous = data.allowAnonymousPosts;
  }
  if (data.allowAnonymousPostsPeers) {
    pluginConfiguration.allow_anonymous_to_peers = data.allowAnonymousPostsPeers;
  }
  if (data.blackoutDates?.length) {
    pluginConfiguration.discussion_blackouts = data.blackoutDates.map((blackoutDates) => (
      denormalizeBlackoutDate(blackoutDates)
    ));
  }
  if (data.discussionTopics?.length) {
    pluginConfiguration.discussion_topics = data.discussionTopics.reduce((topics, currentTopic) => {
      const newTopics = { ...topics };
      newTopics[currentTopic.name] = { id: currentTopic.id };
      return newTopics;
    }, {});
  }
  if (data.divideDiscussionIds) {
    pluginConfiguration.divided_course_wide_discussions = data.divideDiscussionIds;
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
