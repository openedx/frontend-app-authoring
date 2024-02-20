import { reducer, updateStudioHomeCoursesCustomParams } from './slice';

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
    studioHomeCoursesCustomParams: {
      currentPage: 1,
      search: undefined,
      order: 'display_name',
      archivedOnly: false,
      activeOnly: false,
      isFiltered: false,
    },
  };

  it('should return the initial state', () => {
    const result = reducer(undefined, { type: undefined });
    expect(result).toEqual(initialState);
  });

  it('should update the payload passed in studioHomeCoursesCustomParams', () => {
    const newState = {
      ...initialState,
      studioHomeCoursesCustomParams: {
        currentPage: 2,
        search: 'test',
        order: 'display_name',
        archivedOnly: true,
        activeOnly: true,
        isFiltered: true,
      },
    };

    const payload = {
      currentPage: 2,
      isFiltered: true,
      search: 'test',
      order: 'display_name',
      archivedOnly: true,
      activeOnly: true,
    };

    const result = reducer(initialState, updateStudioHomeCoursesCustomParams(payload));
    expect(result).toEqual(newState);
  });
});
