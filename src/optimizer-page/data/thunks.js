import Cookies from 'universal-cookie';
import moment from 'moment';
import { getConfig } from '@edx/frontend-platform';

import { RequestStatus } from '../../data/constants';
// import { setExportCookie } from '../utils';
import { EXPORT_STAGES, LAST_EXPORT_COOKIE_NAME } from './constants';

import {
  postLinkCheck,
  getLinkCheckStatus,
} from './api';
import {
  updateLinkCheckTriggered,
  updateLinkCheckResult,
  updateCurrentStage,
  updateError,
  updateIsErrorModalOpen,
  reset,
  updateLoadingStatus,
  updateSavingStatus,
} from './slice';

// function setExportDate({
//   date, exportStatus, exportOutput, dispatch,
// }) {
//   // If there is no cookie for the last export date, set it now.
//   const cookies = new Cookies();
//   const cookieData = cookies.get(LAST_EXPORT_COOKIE_NAME);
//   if (!cookieData?.completed) {
//     // setExportCookie(date, exportStatus === EXPORT_STAGES.SUCCESS);
//   }
//   // If we don't have export date set yet via cookie, set success date to current date.
//   if (exportOutput && !cookieData?.completed) {
//     dispatch(updateSuccessDate(date));
//   }
// }

export function startLinkCheck(courseId) {
  return async (dispatch) => {
    dispatch(updateSavingStatus({ status: RequestStatus.PENDING }));
    try {
      dispatch(reset());
      dispatch(updateLinkCheckTriggered(true));
      const data = await postLinkCheck(courseId);
      dispatch(updateCurrentStage(data.linkCheckStatus));
      // setExportCookie(moment().valueOf(), exportData.exportStatus === EXPORT_STAGES.SUCCESS);

      dispatch(updateSavingStatus({ status: RequestStatus.SUCCESSFUL }));
      return true;
    } catch (error) {
      dispatch(updateSavingStatus({ status: RequestStatus.FAILED }));
      return false;
    }
  };
}

export function fetchLinkCheckStatus(courseId) {
  return async (dispatch) => {
    dispatch(updateLoadingStatus({ status: RequestStatus.IN_PROGRESS }));
    console.log('fetchLinkCheckStatus');

    try {
      const {
        linkCheckStatus,
        linkCheckOutput,
      } = await getLinkCheckStatus(courseId);
      console.log('linkCheckStatus', linkCheckStatus);
      dispatch(updateCurrentStage(linkCheckStatus));

      if (!linkCheckStatus || linkCheckStatus < 0) {
        dispatch(updateError({ msg: 'Link Check Failed' }));
        dispatch(updateIsErrorModalOpen(true));
      }

      if (linkCheckOutput) {
        dispatch(updateLinkCheckResult(linkCheckOutput));
      }

      dispatch(updateLoadingStatus({ status: RequestStatus.SUCCESSFUL }));
      return true;
    } catch (error) {
      if (error.response && error.response.status === 403) {
        dispatch(updateLoadingStatus({ status: RequestStatus.DENIED }));
      } else {
        dispatch(updateLoadingStatus({ courseId, status: RequestStatus.FAILED }));
      }
      return false;
    }
  };
}
