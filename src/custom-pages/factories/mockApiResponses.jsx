export const courseId = 'course-v1:edX+DemoX+Demo_Course';

export const initialState = {
  courseDetail: {
    courseId,
    status: 'LOADED',
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
        tabId: '1',
      },
    },
  },
};

export const generateXblockData = (
  blockId,
) => ({
  id: blockId,
  display_name: 'test',
  data: '<p>test</p>',
});

export const generateUpdateVisiblityApiResponse = (
  blockId,
  visibility,
) => ({
  id: blockId,
  metadata: { display_name: 'test', course_staff_only: visibility },
});
