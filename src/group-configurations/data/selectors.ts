import { DeprecatedReduxState } from '@src/store';

export const getGroupConfigurationsData = (state: DeprecatedReduxState) => (
  state.groupConfigurations.groupConfigurations
);
export const getLoadingStatus = (state: DeprecatedReduxState) => state.groupConfigurations.loadingStatus;
export const getSavingStatus = (state: DeprecatedReduxState) => state.groupConfigurations.savingStatus;
export const getErrorMessage = (state: DeprecatedReduxState) => state.groupConfigurations.errorMessage;
