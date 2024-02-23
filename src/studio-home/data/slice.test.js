import { reducer, updateStudioHomeCoursesCustomParams } from './slice'; // Assuming the file is named slice.js

import { RequestStatus } from '../../data/constants';

describe('updateStudioHomeCoursesCustomParams action', () => {
  const initialState = {
    loadingStatuses: {
      studioHomeLoadingStatus: RequestStatus.IN_PROGRESS,
      courseNotificationLoadingStatus: RequestStatus.IN_PROGRESS,
      courseLoadingStatus: RequestStatus.IN_PROGRESS,
      libraryLoadingStatus: RequestStatus.IN_PROGRESS,
    },
    savingStatuses: {
      courseCreatorSavingStatus: '',
      deleteNotificationSavingStatus: '',
    },
    studioHomeData: {},
    studioHomeCoursesRequestParams: {
      currentPage: 1,
    },
  };

  it('should return the initial state', () => {
    const result = reducer(undefined, { type: undefined });
    expect(result).toEqual(initialState);
  });

  it('should update the currentPage in studioHomeCoursesRequestParams', () => {
    const newState = {
      ...initialState,
      studioHomeCoursesRequestParams: {
        currentPage: 2,
      },
    };
    const payload = {
      currentPage: 2,
    };

    const result = reducer(initialState, updateStudioHomeCoursesCustomParams(payload));
    expect(result).toEqual(newState);
  });
});
