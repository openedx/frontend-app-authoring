import { RequestStatus } from '../../data/constants';
import { getStudioHomeData, sendRequestForCourseCreator, handleCourseNotification } from './api';
import {
  fetchStudioHomeDataSuccess,
  updateLoadingStatuses,
  updateSavingStatuses,
} from './slice';

function fetchStudioHomeData(search) {
  return async (dispatch) => {
    dispatch(updateLoadingStatuses({ studioHomeLoadingStatus: RequestStatus.IN_PROGRESS }));

    try {
      const studioHomeData = await getStudioHomeData(search || '');
      dispatch(fetchStudioHomeDataSuccess(studioHomeData));
      dispatch(updateLoadingStatuses({ studioHomeLoadingStatus: RequestStatus.SUCCESSFUL }));
    } catch (error) {
      dispatch(updateLoadingStatuses({ studioHomeLoadingStatus: RequestStatus.FAILED }));
    }
  };
}

function handleDeleteNotificationQuery(url) {
  return async (dispatch) => {
    dispatch(updateSavingStatuses({ deleteNotificationSavingStatus: RequestStatus.PENDING }));

    try {
      await handleCourseNotification(url);
      dispatch(updateSavingStatuses({ deleteNotificationSavingStatus: RequestStatus.SUCCESSFUL }));
    } catch (error) {
      dispatch(updateSavingStatuses({ deleteNotificationSavingStatus: RequestStatus.FAILED }));
    }
  };
}

function requestCourseCreatorQuery() {
  return async (dispatch) => {
    dispatch(updateSavingStatuses({ courseCreatorSavingStatus: RequestStatus.PENDING }));

    try {
      await sendRequestForCourseCreator();
      dispatch(updateSavingStatuses({ courseCreatorSavingStatus: RequestStatus.SUCCESSFUL }));
      return true;
    } catch (error) {
      dispatch(updateSavingStatuses({ courseCreatorSavingStatus: RequestStatus.FAILED }));
      return false;
    }
  };
}

export {
  fetchStudioHomeData,
  requestCourseCreatorQuery,
  handleDeleteNotificationQuery,
};
