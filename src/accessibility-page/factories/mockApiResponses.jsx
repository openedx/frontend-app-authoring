import { RequestStatus } from '../../../data/constants';

export const courseId = 'course-v1:edX+DemoX+Demo_Course';

export const initialState = {
  accessibilityPage: {
    savingStatus: '',
  },
};

export const generateEmptyApiResponse = () => ({
  assets: [],
  totalCount: 0,
});

export const getStatusValue = (status) => {
  switch (status) {
  case RequestStatus.FAILED:
    return 429;
  default:
    return 200;
  }
};
