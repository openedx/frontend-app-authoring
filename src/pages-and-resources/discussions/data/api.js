const edXForumsApp = {
  id: 'edx-forums',
  name: 'edX Forum',
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
  logo: 'https://yellowdig.com/static-images/branding/yellowdig-logo.png',
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

export function getApps() {
  return Promise.resolve({
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
    apps: [
      edXForumsApp,
      piazzaApp,
      yellowdigApp,
    ],
    activeAppId: 'piazza',
  });
}

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
      app = edXForumsApp;
  }

  return Promise.resolve({
    app,
    appConfig: {
      id: 'appConfig1',
      consumerSecret: 'its-a-secret-to-everybody',
      consumerKey: 'abc123',
      launchUrl: 'https://localhost/launch',
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
      app = edXForumsApp;
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
