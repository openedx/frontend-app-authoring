import { RequestStatus } from '../../data/constants';
import {
  LINK_CHECK_FAILURE_STATUSES,
  LINK_CHECK_IN_PROGRESS_STATUSES,
  LINK_CHECK_STATUSES,
  SCAN_STAGES,
} from './constants';

import { postLinkCheck, getLinkCheckStatus } from './api';
import {
  updateLinkCheckInProgress,
  updateLinkCheckResult,
  updateCurrentStage,
  updateError,
  updateIsErrorModalOpen,
  updateLoadingStatus,
  updateSavingStatus,
  updateLastScannedAt,
} from './slice';

export function startLinkCheck(courseId: string) {
  return async (dispatch) => {
    dispatch(updateError({ msg: null, unitUrl: null })); // Reset Error State when user click on Start scanning
    dispatch(updateSavingStatus({ status: RequestStatus.PENDING }));
    dispatch(updateLinkCheckInProgress(true));
    dispatch(updateCurrentStage(SCAN_STAGES[LINK_CHECK_STATUSES.PENDING]));
    try {
      await postLinkCheck(courseId);
      await dispatch(updateSavingStatus({ status: RequestStatus.SUCCESSFUL }));
      return true;
    } catch (error) {
      dispatch(updateSavingStatus({ status: RequestStatus.FAILED }));
      dispatch(updateLinkCheckInProgress(false));
      dispatch(updateCurrentStage(SCAN_STAGES[LINK_CHECK_STATUSES.CANCELED]));
      return false;
    }
  };
}

export function fetchLinkCheckStatus(courseId) {
  return async (dispatch) => {
    dispatch(updateLoadingStatus({ status: RequestStatus.IN_PROGRESS }));

    try {
      const { linkCheckStatus, linkCheckOutput, linkCheckCreatedAt } = await getLinkCheckStatus(
        courseId,
      );

      if (LINK_CHECK_IN_PROGRESS_STATUSES.includes(linkCheckStatus)) {
        dispatch(updateLinkCheckInProgress(true));
      } else {
        dispatch(updateLinkCheckInProgress(false));
      }

      dispatch(updateCurrentStage(SCAN_STAGES[linkCheckStatus]));

      if (
        linkCheckStatus === undefined
        || linkCheckStatus === null
        || LINK_CHECK_FAILURE_STATUSES.includes(linkCheckStatus)
      ) {
        dispatch(updateError({ msg: 'Link Check Failed' }));
        dispatch(updateIsErrorModalOpen(true));
      } else if (LINK_CHECK_STATUSES.SUCCEEDED === linkCheckStatus) {
        if (linkCheckOutput) {
          dispatch(updateLinkCheckResult(linkCheckOutput));
        } else {
          dispatch(updateLinkCheckResult([]));
        }
        dispatch(updateLastScannedAt(linkCheckCreatedAt));
      }

      dispatch(updateLoadingStatus({ status: RequestStatus.SUCCESSFUL }));
      return true;
    } catch (error: any) {
      if (error?.response && error?.response.status === 403) {
        dispatch(updateLoadingStatus({ status: RequestStatus.DENIED }));
      } else {
        dispatch(
          updateLoadingStatus({ status: RequestStatus.FAILED }),
        );
      }
      return false;
    }
  };
}
