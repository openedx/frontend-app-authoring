export const getLoadingStatus = (state) => state.pagesAndResources.loadingStatus;
export const getSavingStatus = (state) => state.pagesAndResources.savingStatus;
export const getCourseAppsApiStatus = (state) => state.pagesAndResources.courseAppsApiStatus;
export const getCourseAppSettingValue = (setting) => (state) => (
  state.pagesAndResources.courseAppSettings[setting]?.value
);
export const getResetStatus = (state) => state.pagesAndResources.resetStatus;
