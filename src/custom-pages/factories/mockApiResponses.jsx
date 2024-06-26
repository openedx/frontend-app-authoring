import { RequestStatus } from '../../data/constants';

export const courseId = 'course-v1:edX+DemoX+Demo_Course';

export const initialState = {
  courseDetail: {
    courseId,
    status: 'sucessful',
  },
  customPages: {
    customPagesIds: [
      'mOckID1',
    ],
    loadingStatus: 'successful',
    savingStatus: '',
    deletingStatus: '',
    addingStatus: '',
    customPagesApiStatus: {},
  },
  models: {
    customPages: {
      mOckID1: {
        id: 'mOckID1',
        name: 'test',
        courseStaffOnly: false,
        tabId: 'static_tab_1',
      },
    },
  },
};

export const generateFetchPageApiResponse = () => ([{
  type: 'static_tab',
  title: null,
  is_hideable: false,
  is_hidden: false,
  is_movable: true,
  course_staff_only: false,
  name: 'test',
  tab_id: 'static_tab_1',
  settings: {
    url_slug: '1',
  },
  id: 'mOckID1',
}]);

export const generateXblockData = (
  blockId,
) => ({
  id: blockId,
  display_name: 'test',
  data: '<p>test</p>',
});

export const generateUpdateVisibilityApiResponse = (
  blockId,
  visibility,
) => ({
  id: blockId,
  metadata: { display_name: 'test', course_staff_only: visibility },
});

export const generateNewPageApiResponse = () => ({
  locator: 'mOckID2',
  courseKey: courseId,
});

export const getStatusValue = (status) => {
  switch (status) {
    case RequestStatus.DENIED:
      return 403;
    default:
      return 200;
  }
};
