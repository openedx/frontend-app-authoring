import { RootState } from './slice';

export const getLinkCheckInProgress = (state: RootState) => state.courseOptimizer.linkCheckInProgress;
export const getCurrentStage = (state: RootState) => state.courseOptimizer.currentStage;
export const getDownloadPath = (state: RootState) => state.courseOptimizer.downloadPath;
export const getSuccessDate = (state: RootState) => state.courseOptimizer.successDate;
export const getError = (state: RootState) => state.courseOptimizer.error;
export const getIsErrorModalOpen = (state: RootState) => state.courseOptimizer.isErrorModalOpen;
export const getLoadingStatus = (state: RootState) => state.courseOptimizer.loadingStatus;
export const getSavingStatus = (state: RootState) => state.courseOptimizer.savingStatus;
export const getLinkCheckResult = (state: RootState) => state.courseOptimizer.linkCheckResult;
export const getLastScannedAt = (state: RootState) => state.courseOptimizer.lastScannedAt;
