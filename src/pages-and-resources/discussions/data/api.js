import { camelCaseObject, ensureConfig, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { v4 as uuid } from 'uuid';
import { DivisionSchemes } from '../../../data/constants';

import {
  checkStatus,
  endOfDayTime,
  getTime,
  mergeDateTime,
  normalizeDate,
  normalizeTime,
  sortRestrictedDatesByStatus,
  startOfDayTime,
} from '../app-config-form/utils';
import { restrictedDatesStatus as constants } from './constants';

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

export function normalizeRestrictedDates(data) {
  if (!data || Object.keys(data).length < 1) {
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
    ...sortRestrictedDatesByStatus(normalizeData, constants.ACTIVE, 'desc'),
    ...sortRestrictedDatesByStatus(normalizeData, constants.UPCOMING, 'asc'),
    ...sortRestrictedDatesByStatus(normalizeData, constants.COMPLETE, 'desc'),
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
    reportedContentEmailNotifications: data.reported_content_email_notifications,
    divisionScheme: data.division_scheme,
    alwaysDivideInlineDiscussions: data.always_divide_inline_discussions,
    restrictedDates: normalizeRestrictedDates(data.discussion_blackouts),
    allowDivisionByUnit: false,
    divideByCohorts: enableDivideByCohorts,
    divideCourseTopicsByCohorts: enableDivideCourseTopicsByCohorts,
    cohortsEnabled: data.available_division_schemes?.includes('cohort') || false,
    groupAtSubsection: data.group_at_subsection,
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
    ...normalizePluginConfig(data.plugin_configuration),
    ...normalizeLtiConfig(data.lti_configuration),
  };
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

function normalizeProviders(data) {
  const apps = Object.entries(data.available).map(([key, app]) => ({
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
    features: normalizeFeatures(data.features, apps),
    activeAppId: data.active,
    apps,
  };
}

function normalizeSettings(data) {
  return {
    enabled: data.enabled,
    enableInContext: data.enable_in_context,
    enableGradedUnits: data.enable_graded_units,
    unitLevelVisibility: data.unit_level_visibility,
    postingRestrictions: data.posting_restrictions,
    appConfig: normalizeAppConfig(data),
    piiConfig: normalizePiiSharing(data.lti_configuration),
    discussionTopicIds: data.plugin_configuration.discussion_topics
      ? extractDiscussionTopicIds(data.plugin_configuration.discussion_topics)
      : [],
    discussionTopics: data.plugin_configuration.discussion_topics
      ? normalizeDiscussionTopic(data.plugin_configuration.discussion_topics)
      : [],
    divideDiscussionIds: data.plugin_configuration.divided_course_wide_discussions,
  };
}

export function denormalizeRestrictedDate(restrictedPeriod) {
  return [
    mergeDateTime(
      normalizeDate(restrictedPeriod.startDate),
      normalizeTime(startOfDayTime(restrictedPeriod.startTime)),
    ),
    mergeDateTime(
      normalizeDate(restrictedPeriod.endDate),
      normalizeTime(endOfDayTime(restrictedPeriod.endTime)),
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
  if ('reportedContentEmailNotifications' in data) {
    pluginConfiguration.reported_content_email_notifications = data.reportedContentEmailNotifications;
  }
  if ('divideByCohorts' in data) {
    pluginConfiguration.division_scheme = data.divideByCohorts ? DivisionSchemes.COHORT : DivisionSchemes.NONE;
    pluginConfiguration.always_divide_inline_discussions = data.divideByCohorts;
  }
  if ('groupAtSubsection' in data) {
    pluginConfiguration.group_at_subsection = data.groupAtSubsection;
  }
  if (data.restrictedDates?.length) {
    pluginConfiguration.discussion_blackouts = data.restrictedDates.map((restrictedDates) => (
      denormalizeRestrictedDate(restrictedDates)
    ));
  } else if (data.restrictedDates?.length === 0) {
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

  const apiData = {
    context_key: courseId,
    enabled: data.enabled,
    lti_configuration: ltiConfiguration,
    plugin_configuration: pluginConfiguration,
    provider_type: appId,
  };
  if ('enableInContext' in data) {
    apiData.enable_in_context = data.enableInContext;
  }
  if ('enableGradedUnits' in data) {
    apiData.enable_graded_units = data.enableGradedUnits;
  }
  if ('unitLevelVisibility' in data) {
    apiData.unit_level_visibility = data.unitLevelVisibility;
  }
  if ('postingRestrictions' in data) {
    apiData.posting_restrictions = data.postingRestrictions;
  }
  return apiData;
}

export function getDiscussionsProvidersUrl(courseId) {
  return `${getConfig().STUDIO_BASE_URL}/api/discussions/v0/course/${courseId}/providers`;
}

export function getDiscussionsSettingsUrl(courseId) {
  return `${getConfig().STUDIO_BASE_URL}/api/discussions/v0/course/${courseId}/settings`;
}

export async function getDiscussionsProviders(courseId) {
  const { data } = await getAuthenticatedHttpClient()
    .get(getDiscussionsProvidersUrl(courseId));

  return normalizeProviders(data);
}

export async function getDiscussionsSettings(courseId, providerId = null) {
  const params = {};
  if (providerId) {
    params.params = { provider_id: providerId };
  }
  const url = getDiscussionsSettingsUrl(courseId);
  const { data } = await getAuthenticatedHttpClient()
    .get(url, params);
  return normalizeSettings(data);
}

export async function postDiscussionsSettings(courseId, appId, values) {
  const { data } = await getAuthenticatedHttpClient().post(
    getDiscussionsSettingsUrl(courseId),
    denormalizeData(courseId, appId, values),
  );

  return normalizeSettings(data);
}
