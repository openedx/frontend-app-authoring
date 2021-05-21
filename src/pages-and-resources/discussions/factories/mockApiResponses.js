export const piazzaApiResponse = {
  context_key: 'course-v1:edX+DemoX+Demo_Course',
  enabled: true,
  provider_type: 'piazza',
  features: [
    'discussion-page',
    'embedded-course-sections',
    'wcag-2.1',
    'lti',
  ],
  lti_configuration: {
    lti_1p1_client_key: 'client_key_123',
    lti_1p1_client_secret: 'client_secret_123',
    lti_1p1_launch_url: 'https://localhost/example',
    version: 'lti_1p1',
  },
  plugin_configuration: {},
  providers: {
    active: 'piazza',
    available: {
      legacy: [
        'discussion-page',
        'embedded-course-sections',
        'wcag-2.1',
      ],
      piazza: [
        // We give piazza all features just so we can test our "full support" text.
        'discussion-page',
        'embedded-course-sections',
        'wcag-2.1',
        'lti',
      ],
    },
  },
};

export const legacyApiResponse = {
  context_key: 'course-v1:edX+DemoX+Demo_Course',
  enabled: true,
  provider_type: 'legacy',
  features: [
    'discussion-page',
    'embedded-course-sections',
    'wcag-2.1',
    'lti',
  ],
  lti_configuration: {},
  plugin_configuration: {
    allow_anonymous: false,
    allow_anonymous_to_peers: false,
    always_divide_inline_discussions: false,
    available_division_schemes: ['enrollment_track'],
    discussion_topics: {
      Edx: { id: '13f106c6-6735-4e84-b097-0456cff55960' },
      General: { id: 'course-generated-id-123-client-made-this-up' },
    },
    divided_course_wide_discussions: [],
    divided_inline_discussions: [],
    division_scheme: 'none',
    // Note, this gets stringified when normalized into the app, but the API returns it as an
    // actual array.  Argh.
    discussion_blackouts: [],
  },
  providers: {
    active: 'legacy',
    available: {
      legacy: [
        'discussion-page',
        'embedded-course-sections',
        'wcag-2.1',
      ],
      piazza: [
        // We give piazza all features just so we can test our "full support" text.
        'discussion-page',
        'embedded-course-sections',
        'wcag-2.1',
        'lti',
      ],
    },
  },
};

export const emptyAppApiResponse = {
  context_key: '',
  enabled: null,
  provider_type: '',
  features: [],
  lti_configuration: {},
  plugin_configuration: {},
  providers: {
    active: 'legacy',
    available: {

    },
  },
};
