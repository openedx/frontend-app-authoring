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
  id: 'edx-discussions',
  name: 'edX Discussions',
  logo: 'https://cdn-blog.lawrencemcdaniel.com/wp-content/uploads/2018/01/22125436/edx-logo.png',
  description: 'Start conversations with other learners, ask questions, and interact with other learners in the course.',
  supportLevel: 'Full support',
  isAvailable: true,
  documentationUrl: 'https://localhost/docs',
  featureIds: [
    'lti',
    'discussion-page',
    'embedded-course-sections',
    'embedded-course-units',
    'wcag-2.1',
  ],
};

const piazzaApp = {
  id: 'piazza',
  name: 'Piazza',
  logo: 'https://piazza.com/images/splash2/topbar/piazza_logo_blue.png',
  description: 'Piazza is designed to connect students, TAs, and professors so every student can get the help they need when they need it.',
  supportLevel: 'Partial support',
  isAvailable: true,
  documentationUrl: 'https://localhost/docs',
  featureIds: [
    'lti',
    'discussion-page',
    'embedded-course-sections',
    'wcag-2.1',
  ],
};

const yellowdigApp = {
  id: 'yellowdig',
  name: 'Yellowdig',
  logo: 'https://static.wixstatic.com/media/e53d7e_f8a17bd41db64a57a8d62bea4fdf3174~mv2.png/v1/crop/x_5,y_0,w_895,h_196/fill/w_366,h_80,al_c,q_85,usm_0.66_1.00_0.01/yellowdig-logo.webp',
  description: 'Yellowdig is the digital solution that impacts the entire student lifecycle and enables lifelong learning.',
  supportLevel: 'Coming soon',
  isAvailable: false,
  documentationUrl: 'https://localhost/docs',
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

  if (appId === 'edx-discussions') {
    appConfig = {
      id: 'appConfig2',
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
