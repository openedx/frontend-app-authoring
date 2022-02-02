import { ensureConfig, getConfig, camelCaseObject } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import _ from 'lodash';
import { v4 as uuid } from 'uuid';

import {
  checkStatus,
  sortBlackoutDatesByStatus,
  mergeDateTime,
  normalizeDate,
  normalizeTime,
  getTime,
  startOfDayTime,
  endOfDayTime,
} from '../app-config-form/utils';
import { blackoutDatesStatus as constants } from './constants';
import { DivisionSchemes } from '../../../data/constants';

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

export function normalizeBlackoutDates(data) {
  if (!data.length) {
    return [];
  }

  const normalizeData = data.map(([startDate, endDate]) => ({
    id: uuid(),
    startDate: normalizeDate(startDate),
    startTime: getTime(startDate),
    endDate: normalizeDate(endDate),
    endTime: getTime(endDate),
    status: checkStatus([startDate, endDate]),
  }));

  return [
    ...sortBlackoutDatesByStatus(normalizeData, constants.ACTIVE, 'desc'),
    ...sortBlackoutDatesByStatus(normalizeData, constants.UPCOMING, 'asc'),
    ...sortBlackoutDatesByStatus(normalizeData, constants.COMPLETE, 'desc'),
  ];
}

function normalizePluginConfig(data) {
  if (!data || Object.keys(data).length < 1) {
    return {};
  }
  const enableDivideByCohorts = data.always_divide_inline_discussions && data.division_scheme === 'cohort';
  const enableDivideCourseTopicsByCohorts = enableDivideByCohorts && data.divided_course_wide_discussions.length > 0;
  return {
    allowAnonymousPosts: data.allow_anonymous,
    allowAnonymousPostsPeers: data.allow_anonymous_to_peers,
    divisionScheme: data.division_scheme,
    alwaysDivideInlineDiscussions: data.always_divide_inline_discussions,
    blackoutDates: normalizeBlackoutDates(data.discussion_blackouts),
    allowDivisionByUnit: false,
    divideByCohorts: enableDivideByCohorts,
    divideCourseTopicsByCohorts: enableDivideCourseTopicsByCohorts,
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
  let ltiConfig = {};
  const legacyConfig = {
    id: 'legacy',
    ...normalizePluginConfig(data.plugin_configuration),
  };
  const piiConfig = {
    id: 'pii',
    ...normalizePiiSharing(data.lti_configuration),
  };
  if (data.providers.active !== 'legacy') {
    ltiConfig = {
      id: data.providers.active,
      ...normalizeLtiConfig(data.lti_configuration),
    };
  }
  if (!_.isEmpty(ltiConfig)) { return [legacyConfig, ltiConfig, piiConfig]; }
  return [legacyConfig, piiConfig];
}

function normalizeDiscussionTopic(data) {
  return Object.entries(data).map(([key, value]) => ({
    name: key,
    id: value.id,
  }));
}

function extractDiscussionTopicIds(data) {
  return Object.entries(
    data,
    // eslint-disable-next-line no-unused-vars
  ).map(([key, value]) => value.id);
}

function normalizeFeatures(data, apps) {
  if (!data || data.length < 1) {
    return [];
  }

  return camelCaseObject(
    data.filter((feature) => apps.map((app) => app.featureIds.includes(feature.id)).some((supported) => supported)),
  );
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
    adminOnlyConfig: !!app.admin_only_config || true,
  }));
  return {
    courseId: data.context_key,
    enabled: data.enabled,
    features: normalizeFeatures(data.features, apps),
    appConfigs: normalizeAppConfig(data),
    activeAppId: data.providers.active,
    apps,
    discussionTopicIds: data.plugin_configuration.discussion_topics
      ? extractDiscussionTopicIds(data.plugin_configuration.discussion_topics)
      : [],
    discussionTopics: data.plugin_configuration.discussion_topics
      ? normalizeDiscussionTopic(data.plugin_configuration.discussion_topics)
      : [],
    divideDiscussionIds: data.plugin_configuration.divided_course_wide_discussions,
  };
}

export function denormalizeBlackoutDate(blackoutPeriod) {
  return [
    mergeDateTime(
      normalizeDate(blackoutPeriod.startDate),
      normalizeTime(startOfDayTime(blackoutPeriod.startTime)),
    ),
    mergeDateTime(
      normalizeDate(blackoutPeriod.endDate),
      normalizeTime(endOfDayTime(blackoutPeriod.endTime)),
    ),
  ];
}

function denormalizeData(courseId, appId, data) {
  const pluginConfiguration = {};

  if ('allowAnonymousPosts' in data) {
    pluginConfiguration.allow_anonymous = data.allowAnonymousPosts;
  }
  if ('allowAnonymousPostsPeers' in data) {
    pluginConfiguration.allow_anonymous_to_peers = data.allowAnonymousPostsPeers;
  }
  if ('divideByCohorts' in data) {
    pluginConfiguration.division_scheme = data.divideByCohorts ? DivisionSchemes.COHORT : DivisionSchemes.NONE;
    pluginConfiguration.always_divide_inline_discussions = data.divideByCohorts;
  }
  if (data.blackoutDates?.length) {
    pluginConfiguration.discussion_blackouts = data.blackoutDates.map((blackoutDates) => (
      denormalizeBlackoutDate(blackoutDates)
    ));
  } else if (data.blackoutDates?.length === 0) {
    pluginConfiguration.discussion_blackouts = [];
  }
  if (data.discussionTopics?.length) {
    pluginConfiguration.discussion_topics = data.discussionTopics.reduce((topics, currentTopic) => {
      const newTopics = { ...topics };
      newTopics[currentTopic.name] = { id: currentTopic.id };
      return newTopics;
    }, {});
  }
  if ('divideCourseTopicsByCohorts' in data) {
    pluginConfiguration.divided_course_wide_discussions = data.divideCourseTopicsByCohorts
      ? data.divideDiscussionIds : [];
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
  return `${getConfig().STUDIO_BASE_URL}/api/discussions/v0/${courseId}`;
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
