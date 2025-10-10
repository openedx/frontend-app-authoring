import { type DeprecatedReduxState } from '@src/store';

export const getStudioHomeData = (state: DeprecatedReduxState) => state.studioHome.studioHomeData;
export const getLoadingStatuses = (state: DeprecatedReduxState) => state.studioHome.loadingStatuses;
export const getSavingStatuses = (state: DeprecatedReduxState) => state.studioHome.savingStatuses;
export const getStudioHomeCoursesParams = (state: DeprecatedReduxState) => (
  state.studioHome.studioHomeCoursesRequestParams
);
