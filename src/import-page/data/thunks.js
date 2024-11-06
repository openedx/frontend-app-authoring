import Cookies from 'universal-cookie';
import moment from 'moment';

import { RequestStatus } from '../../data/constants';
import { setImportCookie } from '../utils';
import { getImportStatus, startCourseImporting } from './api';
import {
  reset, updateCurrentStage, updateError, updateFileName, updateProgress,
  updateImportTriggered, updateLoadingStatus, updateSavingStatus, updateSuccessDate,
} from './slice';
import { IMPORT_STAGES, LAST_IMPORT_COOKIE_NAME } from './constants';

export function fetchImportStatus(courseId, fileName) {
  return async (dispatch) => {
    try {
      dispatch(updateLoadingStatus(RequestStatus.IN_PROGRESS));
      const { importStatus, message } = await getImportStatus(courseId, fileName);
      dispatch(updateCurrentStage(Math.abs(importStatus)));
      const cookies = new Cookies();
      const cookieData = cookies.get(LAST_IMPORT_COOKIE_NAME);

      if (importStatus < 0) {
        dispatch(updateError({ hasError: true, message }));
      } else if (importStatus === IMPORT_STAGES.SUCCESS && !cookieData?.completed) {
        dispatch(updateSuccessDate(moment().valueOf()));
      }

      if (!cookieData?.completed) {
        setImportCookie(moment().valueOf(), importStatus === IMPORT_STAGES.SUCCESS, fileName);
      }
      dispatch(updateLoadingStatus(RequestStatus.SUCCESSFUL));
      return true;
    } catch (error) {
      if (error.response && error.response.status === 403) {
        dispatch(updateLoadingStatus(RequestStatus.DENIED));
      } else {
        dispatch(updateLoadingStatus(RequestStatus.FAILED));
      }
      return false;
    }
  };
}

export function handleProcessUpload(courseId, fileData, requestConfig, handleError) {
  return async (dispatch) => {
    try {
      const file = fileData.get('file');
      dispatch(reset());
      dispatch(updateSavingStatus(RequestStatus.PENDING));
      dispatch(updateFileName(file.name));
      dispatch(updateImportTriggered(true));
      const { importStatus } = await startCourseImporting(
        courseId,
        file,
        requestConfig,
        (percent) => dispatch(updateProgress(percent)),
      );
      dispatch(updateCurrentStage(importStatus));
      setImportCookie(moment().valueOf(), importStatus === IMPORT_STAGES.SUCCESS, file.name);
      dispatch(updateSavingStatus(RequestStatus.SUCCESSFUL));
      return true;
    } catch (error) {
      handleError(error);
      dispatch(updateSavingStatus(RequestStatus.FAILED));
      return false;
    }
  };
}
