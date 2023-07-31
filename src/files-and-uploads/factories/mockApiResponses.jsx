import { RequestStatus } from '../../data/constants';

export const courseId = 'course-v1:edX+DemoX+Demo_Course';

export const initialState = {
  courseDetail: {
    courseId,
    status: 'sucessful',
  },
  assets: {
    assetIds: ['mOckID1'],
    loadingStatus: 'successful',
    savingStatus: '',
    deletingStatus: '',
    addingStatus: '',
    customPagesApiStatus: {},
  },
  models: {
    assets: {
      mOckID1: {
        id: 'mOckID1',
        displayName: 'test',
        locked: false,
        externalUrl: 'static_tab_1',
        portableUrl: '',
        contentType: '',
        wrapperType: '',
        dateAdded: '',
      },
    },
  },
};

export const generateFetchAssetApiResponse = () => ([{
  assets: [{
    id: 'mOckID1',
    displayName: 'test',
    locked: false,
    externalUrl: 'static_tab_1',
    portableUrl: '',
    contentType: '',
    wrapperType: '',
    dateAdded: '',
    thumbnail: '',
  }],
  totalCount: 1,
}]);

export const generateEmptyApiResponse = () => ([{
  assets: [],
  totalCount: 0,
}]);

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

export const generateNewAssetApiResponse = () => ({
  asset: {
    display_name: 'download.png',
    content_type: 'image/png',
    date_added: 'Jul 26, 2023 at 14:07 UTC',
    url: '/download.png',
    external_url: 'http://download.png',
    portable_url: '/static/download.png',
    thumbnail: '/download.png',
    locked: false,
    id: 'mOckID2',
  },
});

export const getStatusValue = (status) => {
  switch (status) {
  case RequestStatus.DENIED:
    return 403;
  default:
    return 200;
  }
};
