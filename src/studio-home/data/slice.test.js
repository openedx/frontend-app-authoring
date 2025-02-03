import { reducer, resetStudioHomeCoursesCustomParams, updateStudioHomeCoursesCustomParams } from './slice';

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
      search: '',
      order: 'display_name',
      archivedOnly: undefined,
      activeOnly: undefined,
      isFiltered: false,
      cleanFilters: false,
    },
  };

  const modifiedRequestParamsState = {
    ...initialState,
    studioHomeCoursesRequestParams: {
      currentPage: 2,
      search: 'test',
      order: 'display_name',
      archivedOnly: true,
      activeOnly: true,
      isFiltered: true,
      cleanFilters: true,
    },
  };

  const payload = {
    currentPage: 2,
    search: 'test',
    order: 'display_name',
    archivedOnly: true,
    activeOnly: true,
    isFiltered: true,
    cleanFilters: true,
  };

  it('should return the initial state', () => {
    const result = reducer(undefined, { type: undefined });
    expect(result).toEqual(initialState);
  });

  it('should update the payload passed in studioHomeCoursesRequestParams', () => {
    const result = reducer(initialState, updateStudioHomeCoursesCustomParams(payload));
    expect(result).toEqual(modifiedRequestParamsState);
  });

  it('should reset the studioHomeCoursesRequestParams state to the initial value', () => {
    const stateChanged = reducer(initialState, updateStudioHomeCoursesCustomParams(payload));
    expect(stateChanged).toEqual(modifiedRequestParamsState);

    const stateReset = reducer(stateChanged, resetStudioHomeCoursesCustomParams());
    expect(stateReset.studioHomeCoursesRequestParams).toEqual(initialState.studioHomeCoursesRequestParams);
  });
});
