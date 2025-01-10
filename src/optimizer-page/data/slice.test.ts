import { AnyAction, configureStore, ThunkMiddleware } from '@reduxjs/toolkit';
import { ToolkitStore } from '@reduxjs/toolkit/dist/configureStore';
import {
  CourseOptimizerState,
  reducer,
  updateLinkCheckInProgress,
  updateLinkCheckResult,
  updateLastScannedAt,
  updateCurrentStage,
  updateDownloadPath,
  updateSuccessDate,
  updateError,
  updateIsErrorModalOpen,
  reset,
  updateLoadingStatus,
  updateSavingStatus,
} from './slice';

describe('courseOptimizer slice', () => {
  let store: ToolkitStore<CourseOptimizerState, AnyAction, [ThunkMiddleware<CourseOptimizerState, AnyAction>]>;

  beforeEach(() => {
    store = configureStore({ reducer });
  });

  it('should handle initial state', () => {
    expect(store.getState()).toEqual({
      linkCheckInProgress: null,
      linkCheckResult: null,
      lastScannedAt: null,
      currentStage: null,
      error: { msg: null, unitUrl: null },
      downloadPath: null,
      successDate: null,
      isErrorModalOpen: false,
      loadingStatus: '',
      savingStatus: '',
    });
  });

  it('should handle updateLinkCheckInProgress', () => {
    store.dispatch(updateLinkCheckInProgress(true));
    expect(store.getState().linkCheckInProgress).toBe(true);
  });

  it('should handle updateLinkCheckResult', () => {
    const result = { valid: true };
    store.dispatch(updateLinkCheckResult(result));
    expect(store.getState().linkCheckResult).toEqual(result);
  });

  it('should handle updateLastScannedAt', () => {
    const date = '2023-10-01';
    store.dispatch(updateLastScannedAt(date));
    expect(store.getState().lastScannedAt).toBe(date);
  });

  it('should handle updateCurrentStage', () => {
    store.dispatch(updateCurrentStage(2));
    expect(store.getState().currentStage).toBe(2);
  });

  it('should handle updateDownloadPath', () => {
    const path = '/path/to/download';
    store.dispatch(updateDownloadPath(path));
    expect(store.getState().downloadPath).toBe(path);
  });

  it('should handle updateSuccessDate', () => {
    const date = '2023-10-01';
    store.dispatch(updateSuccessDate(date));
    expect(store.getState().successDate).toBe(date);
  });

  it('should handle updateError', () => {
    const error = { msg: 'Error message', unitUrl: 'http://example.com' };
    store.dispatch(updateError(error));
    expect(store.getState().error).toEqual(error);
  });

  it('should handle updateIsErrorModalOpen', () => {
    store.dispatch(updateIsErrorModalOpen(true));
    expect(store.getState().isErrorModalOpen).toBe(true);
  });

  it('should handle reset', () => {
    store.dispatch(reset());
    expect(store.getState()).toEqual({
      linkCheckInProgress: null,
      linkCheckResult: null,
      lastScannedAt: null,
      currentStage: null,
      error: { msg: null, unitUrl: null },
      downloadPath: null,
      successDate: null,
      isErrorModalOpen: false,
      loadingStatus: '',
      savingStatus: '',
    });
  });

  it('should handle updateLoadingStatus', () => {
    store.dispatch(updateLoadingStatus({ status: 'loading' }));
    expect(store.getState().loadingStatus).toBe('loading');
  });

  it('should handle updateSavingStatus', () => {
    store.dispatch(updateSavingStatus({ status: 'saving' }));
    expect(store.getState().savingStatus).toBe('saving');
  });
});
