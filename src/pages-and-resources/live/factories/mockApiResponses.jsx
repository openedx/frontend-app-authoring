export const courseId = 'course-v1:edX+DemoX+Demo_Course';

export const initialState = {
  courseDetail: {
    courseId,
    status: 'LOADED',
  },
  pagesAndResources: {
    courseAppIds: [
      'live',
    ],
    loadingStatus: 'successful',
    savingStatus: '',
    courseAppsApiStatus: {},
    courseAppSettings: {},
  },
  models: {
    courseApps: {
      live: {
        id: 'live',
        enabled: true,
        name: 'Live',
        description: 'Enable in-platform video conferencing by configuring live',
        allowedOperations: {
          enable: true,
          configure: true,
        },
        documentationLinks: {
          learnMoreConfiguration: '',
        },
      },
    },
  },
  live: {
    providers: {
      available: {
        zoom: {
          name: 'Zoom LTI PRO',
          features: [],
        },
      },
      selectedProvider: {},
      active: 'zoom',
    },
    appIds: [
      {
        id: 'zoom',
      },
    ],
    status: 'successful',
    configuration: {
      courseKey: '',
      enabled: true,
      consumerKey: '',
      consumerSecret: '',
      launchUrl: '',
      launchEmail: '',
      provider: 'zoom',
    },
    saveStatus: 'successful',
    configuredProvider: 'zoom',
  },
};

export const generateLiveConfigurationApiResponse = (
  enabled = true,
) => ({
  course_key: courseId,
  provider_type: 'zoom',
  enabled,
  lti_configuration: {
    lti_1p1_client_key: 'consumer_key',
    lti_1p1_client_secret: 'secret_key',
    lti_1p1_launch_url: 'https://launch-url.com',
    version: 'lti_1p1',
    lti_config: {
      additional_parameters: {
        custom_instructor_email: 'launch@email.com',
      },
    },
  },
});
