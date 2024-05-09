import {
  hideProcessingNotification,
  showProcessingNotification,
} from '../../generic/processing-notification/data/slice';
import { handleResponseErrors } from '../../generic/saving-error-alert';
import { RequestStatus } from '../../data/constants';
import { NOTIFICATION_MESSAGES } from '../../constants';
import {
  fetchTextbooks,
  updateLoadingStatus,
  updateSavingStatus,
  createTextbookSuccess,
  editTextbookSuccess,
  deleteTextbookSuccess,
} from './slice';
import {
  getTextbooks,
  createTextbook,
  editTextbook,
  deleteTextbook,
} from './api';

export function fetchTextbooksQuery(courseId) {
  return async (dispatch) => {
    dispatch(updateLoadingStatus({ status: RequestStatus.IN_PROGRESS }));

    try {
      const { textbooks } = await getTextbooks(courseId);
      dispatch(fetchTextbooks({ textbooks }));
      dispatch(updateLoadingStatus({ status: RequestStatus.SUCCESSFUL }));
    } catch (error) {
      dispatch(updateLoadingStatus({ status: RequestStatus.FAILED }));
    }
  };
}

export function createTextbookQuery(courseId, textbook) {
  return async (dispatch) => {
    dispatch(updateSavingStatus({ status: RequestStatus.IN_PROGRESS }));
    dispatch(showProcessingNotification(NOTIFICATION_MESSAGES.saving));

    try {
      const data = await createTextbook(courseId, textbook);
      dispatch(createTextbookSuccess(data));
      dispatch(updateSavingStatus({ status: RequestStatus.SUCCESSFUL }));
    } catch (error) {
      handleResponseErrors(error, dispatch, updateSavingStatus);
    } finally {
      dispatch(hideProcessingNotification());
    }
  };
}

export function editTextbookQuery(courseId, textbook) {
  return async (dispatch) => {
    dispatch(updateSavingStatus({ status: RequestStatus.IN_PROGRESS }));
    dispatch(showProcessingNotification(NOTIFICATION_MESSAGES.saving));

    try {
      const data = await editTextbook(courseId, textbook);
      dispatch(editTextbookSuccess(data));
      dispatch(updateSavingStatus({ status: RequestStatus.SUCCESSFUL }));
    } catch (error) {
      handleResponseErrors(error, dispatch, updateSavingStatus);
    } finally {
      dispatch(hideProcessingNotification());
    }
  };
}

export function deleteTextbookQuery(courseId, textbookId) {
  return async (dispatch) => {
    dispatch(updateSavingStatus({ status: RequestStatus.IN_PROGRESS }));
    dispatch(showProcessingNotification(NOTIFICATION_MESSAGES.deleting));

    try {
      await deleteTextbook(courseId, textbookId);
      dispatch(deleteTextbookSuccess(textbookId));
      dispatch(updateSavingStatus({ status: RequestStatus.SUCCESSFUL }));
    } catch (error) {
      handleResponseErrors(error, dispatch, updateSavingStatus);
    } finally {
      dispatch(hideProcessingNotification());
    }
  };
}
