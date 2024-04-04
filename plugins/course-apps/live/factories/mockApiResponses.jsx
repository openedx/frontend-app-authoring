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
};

export const configurationProviders = (
  emailSharing,
  usernameSharing,
  activeProvider,
  hasFreeTier,
) => ({
  providers: {
    active: activeProvider || 'zoom',
    available: {
      zoom: {
        features: [],
        name: 'Zoom LTI PRO',
        pii_sharing: {
          email: emailSharing,
          username: usernameSharing,
        },
      },

      big_blue_button: {
        additional_parameters: [],
        features: [],
        has_free_tier: hasFreeTier,
        name: 'Big Blue Button',
      },
    },
  },
});

export const generateLiveConfigurationApiResponse = (
  enabled,
  piiSharingAllowed,
  providerType = 'zoom',
  isFreeTier = undefined,
) => ({
  course_key: courseId,
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
  pii_sharing_allowed: piiSharingAllowed,
  provider_type: providerType,
  free_tier: providerType === 'bigBlueButton' ? isFreeTier : undefined,
});
