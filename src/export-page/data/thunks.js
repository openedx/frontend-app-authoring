import Cookies from 'universal-cookie';
import moment from 'moment';
import { getConfig } from '@edx/frontend-platform';

import { RequestStatus } from '../../data/constants';
import { setExportCookie } from '../utils';
import { EXPORT_STAGES, LAST_EXPORT_COOKIE_NAME } from './constants';

import {
  startCourseExporting,
  getExportStatus,
} from './api';
import {
  updateExportTriggered,
  updateCurrentStage,
  updateDownloadPath,
  updateSuccessDate,
  updateError,
  updateIsErrorModalOpen,
  reset,
  updateLoadingStatus,
  updateSavingStatus,
} from './slice';

export function startExportingCourse(courseId) {
  return async (dispatch) => {
    dispatch(updateSavingStatus({ status: RequestStatus.PENDING }));
    try {
      dispatch(reset());
      dispatch(updateExportTriggered(true));
      const exportData = await startCourseExporting(courseId);
      dispatch(updateCurrentStage(exportData.exportStatus));
      setExportCookie(moment().valueOf(), exportData.exportStatus === EXPORT_STAGES.SUCCESS);

      dispatch(updateSavingStatus({ status: RequestStatus.SUCCESSFUL }));
      return true;
    } catch (error) {
      dispatch(updateSavingStatus({ status: RequestStatus.FAILED }));
      return false;
    }
  };
}

export function fetchExportStatus(courseId) {
  return async (dispatch) => {
    dispatch(updateLoadingStatus({ status: RequestStatus.IN_PROGRESS }));
    try {
      const { exportStatus, exportOutput, exportError } = await getExportStatus(courseId);
      dispatch(updateCurrentStage(Math.abs(exportStatus)));

      if (exportOutput) {
        if (exportOutput.startsWith('/')) {
          dispatch(updateDownloadPath(`${getConfig().STUDIO_BASE_URL}${exportOutput}`));
        } else {
          dispatch(updateDownloadPath(exportOutput));
        }
        dispatch(updateSuccessDate(moment().valueOf()));
      }

      const cookies = new Cookies();
      const cookieData = cookies.get(LAST_EXPORT_COOKIE_NAME);
      if (!cookieData?.completed) {
        setExportCookie(moment().valueOf(), exportStatus === EXPORT_STAGES.SUCCESS);
      }

      if (exportError) {
        const errorMessage = exportError.rawErrorMsg || exportError;
        const errorUnitUrl = exportError.editUnitUrl || null;
        dispatch(updateError({ msg: errorMessage, unitUrl: errorUnitUrl }));
        dispatch(updateIsErrorModalOpen(true));
      }

      dispatch(updateLoadingStatus({ status: RequestStatus.SUCCESSFUL }));
      return true;
    } catch (error) {
      dispatch(updateLoadingStatus({ status: RequestStatus.FAILED }));
      return false;
    }
  };
}
