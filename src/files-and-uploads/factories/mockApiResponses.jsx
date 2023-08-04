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
    errors: {
      upload: [],
      delete: [],
      lock: [],
    },
  },
  models: {
    assets: {
      mOckID1: {
        id: 'mOckID0',
        displayName: 'mOckID0',
        locked: true,
        externalUrl: 'static_tab_1',
        portableUrl: '',
        contentType: 'application/pdf',
        wrapperType: 'document',
        dateAdded: '',
        thumbnail: null,
      },
    },
  },
};

export const generateFetchAssetApiResponse = () => ({
  assets: [
    {
      id: 'mOckID1',
      displayName: 'mOckID1',
      locked: true,
      externalUrl: 'static_tab_1',
      portableUrl: '',
      contentType: 'image/png',
      dateAdded: '',
      thumbnail: '/asset',
    },
    {
      id: 'mOckID3',
      displayName: 'mOckID3',
      locked: false,
      externalUrl: 'static_tab_1',
      portableUrl: '',
      contentType: 'application/pdf',
      dateAdded: '',
      thumbnail: null,
    },
    {
      id: 'mOckID4',
      displayName: 'mOckID4',
      locked: false,
      externalUrl: 'static_tab_1',
      portableUrl: '',
      contentType: 'audio/mp3',
      dateAdded: '',
      thumbnail: null,
    },
    {
      id: 'mOckID5',
      displayName: 'mOckID5',
      locked: false,
      externalUrl: 'static_tab_1',
      portableUrl: '',
      contentType: 'application/json',
      dateAdded: '',
      thumbnail: null,
    },
    {
      id: 'mOckID6',
      displayName: 'mOckID6',
      locked: false,
      externalUrl: 'static_tab_1',
      portableUrl: '',
      contentType: 'application/octet-stream',
      dateAdded: '',
      thumbnail: null,
    },
  ],
  totalCount: 50,
});

export const generateEmptyApiResponse = () => ([{
  assets: [],
  totalCount: 0,
}]);

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
