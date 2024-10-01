export const courseId = 'course-v1:org+num+run';

export const inititalState = {
  courseDetail: {
    courseId,
    status: 'successful',
  },
  pagesAndResources: {
    courseAppIds: ['ora_settings'],
    loadingStatus: 'in-progress',
    savingStatus: '',
    courseAppsApiStatus: {},
    courseAppSettings: {},
  },
  models: {
    courseApps: {
      ora_settings: {
        id: 'ora_settings',
        name: 'Flexible Peer Grading',
        enabled: true,
        description: 'Enable flexible peer grading',
        allowedOperations: {
          enable: false,
          configure: true,
        },
        documentationLinks: {
          learnMoreConfiguration: '',
        },
      },
    },
  },
};
