import { RequestStatus } from '@src/data/constants';
import studioHomeMock from '@src/studio-home/__mocks__/studioHomeMock';

export const courseId = 'course-v1:edX+DemoX+Demo_Course';

export const initialState = {
  generic: {
    createOrRerunCourse: {
      courseData: {},
      courseRerunData: {},
      redirectUrlObj: {},
      postErrors: {},
    },
    loadingStatuses: {
      organizationLoadingStatus: 'successful', courseRerunLoadingStatus: 'successful',
    },
    organizations: ['krisEdx', 'krisEd', 'DeveloperInc', 'importMit', 'testX', 'edX', 'developerInb'],
    savingStatus: '',
  },
  studioHome: {
    loadingStatuses: {
      studioHomeLoadingStatus: RequestStatus.SUCCESSFUL,
      courseNotificationLoadingStatus: RequestStatus.IN_PROGRESS,
    },
    savingStatuses: {
      courseCreatorSavingStatus: '',
      deleteNotificationSavingStatus: '',
    },
    studioHomeData: studioHomeMock,
  },
};
