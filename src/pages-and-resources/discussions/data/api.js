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

export async function getApps(courseId) {
  const { data } = await getAuthenticatedHttpClient()
    .get(`${getConfig().LMS_BASE_URL}/discussions/api/v0/${courseId}`);

  return normalizeApps(data);
}

const legacyEdXDiscussions = {
  id: 'legacy',
  hasFullSupport: false,
  featureIds: [
    'discussion-page',
    'embedded-course-sections',
    'wcag-2.1',
  ],
};

const piazzaApp = {
  id: 'piazza',
  hasFullSupport: false,
  featureIds: [
    'lti',
    'discussion-page',
    'embedded-course-sections',
    'wcag-2.1',
  ],
};

const yellowdigApp = {
  id: 'yellowdig',
  hasFullSupport: false,
  featureIds: [
    'lti',
    'discussion-page',
    'embedded-course-sections',
    'wcag-2.1',
  ],
};

export function getAppConfig(courseId, appId) {
  let app = null;
  switch (appId) {
    case 'piazza':
      app = piazzaApp;
      break;
    case 'yellowdig':
      app = yellowdigApp;
      break;
    default:
      app = legacyEdXDiscussions;
  }

  let appConfig = {
    id: 'appConfig1',
    consumerSecret: 'its-a-secret-to-everybody',
    consumerKey: 'abc123',
    launchUrl: 'https://localhost/launch',
  };

  if (appId === 'legacy') {
    appConfig = {
      id: 'legacy',
      divideByCohorts: false,
      allowDivisionByUnit: false,
      divideCourseWideTopics: false,
      divideGeneralTopic: false,
      divideQuestionsForTAs: false,
      inContextDiscussion: false,
      gradedUnitPages: false,
      groupInContextSubsection: false,
      allowUnitLevelVisibility: false,
      allowAnonymousPosts: false,
      allowAnonymousPostsPeers: false,
      blackoutDates: '[]',
    };
  }

  return Promise.resolve({
    app,
    appConfig,
    features: [
      {
        id: 'lti',
      },
      {
        id: 'discussion-page',
      },
      {
        id: 'embedded-course-sections',
      },
      {
        id: 'embedded-course-units',
      },
      {
        id: 'wcag-2.1',
      },
    ],
  });
}

export function postAppConfig(courseId, appId, drafts) {
  let app = null;
  switch (appId) {
    case 'piazza':
      app = piazzaApp;
      break;
    case 'yellowdig':
      app = yellowdigApp;
      break;
    default:
      app = legacyEdXDiscussions;
  }
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        app,
        appConfig: {
          id: 'appConfig1',
          consumerSecret: 'its-a-secret-to-everybody',
          consumerKey: 'abc123',
          launchUrl: 'https://localhost/launch',
          documentationUrl: 'https://localhost/docs',
          ...drafts,
        },
        features: [
          {
            id: 'lti',
            name: 'LTI Integration',
          },
          {
            id: 'discussion-page',
            name: 'Discussion Page',
          },
          {
            id: 'embedded-course-sections',
            name: 'Embedded Course Sections',
          },
          {
            id: 'embedded-course-units',
            name: 'Embedded Course Units',
          },
          {
            id: 'wcag-2.1',
            name: 'WCAG 2.1 Support',
          },
        ],
      });
    }, 1000);
  });
}
