import { RequestStatus } from '../../../data/constants';
import { studioHomeMock } from '../../../studio-home/__mocks__';

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
