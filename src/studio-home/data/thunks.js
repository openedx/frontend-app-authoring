import { RequestStatus } from '../../data/constants';
import {
  getStudioHomeData,
  sendRequestForCourseCreator,
  handleCourseNotification,
  getStudioHomeCourses,
  getStudioHomeLibraries,
} from './api';
import {
  fetchStudioHomeDataSuccess,
  fetchCourseDataSuccess,
  updateLoadingStatuses,
  updateSavingStatuses,
  fetchLibraryDataSuccess,
} from './slice';

function fetchStudioHomeData(search, hasHomeData) {
  return async (dispatch) => {
    dispatch(updateLoadingStatuses({ studioHomeLoadingStatus: RequestStatus.IN_PROGRESS }));
    dispatch(updateLoadingStatuses({ courseLoadingStatus: RequestStatus.IN_PROGRESS }));

    if (!hasHomeData) {
      try {
        const studioHomeData = await getStudioHomeData(search || '');
        dispatch(fetchStudioHomeDataSuccess(studioHomeData));
        dispatch(updateLoadingStatuses({ studioHomeLoadingStatus: RequestStatus.SUCCESSFUL }));
        try {
          const coursesData = await getStudioHomeCourses(search || '');
          dispatch(fetchCourseDataSuccess(coursesData));
          dispatch(updateLoadingStatuses({ courseLoadingStatus: RequestStatus.SUCCESSFUL }));
        } catch (error) {
          dispatch(updateLoadingStatuses({ courseLoadingStatus: RequestStatus.FAILED }));
        }
      } catch (error) {
        dispatch(updateLoadingStatuses({ studioHomeLoadingStatus: RequestStatus.FAILED }));
        // return false;
      }
    }
  };
}

function fetchLibraryData() {
  return async (dispatch) => {
    dispatch(updateLoadingStatuses({ libraryLoadingStatus: RequestStatus.IN_PROGRESS }));

    try {
      const libraryData = await getStudioHomeLibraries();
      dispatch(fetchLibraryDataSuccess(libraryData));
      dispatch(updateLoadingStatuses({ libraryLoadingStatus: RequestStatus.SUCCESSFUL }));
    } catch (error) {
      dispatch(updateLoadingStatuses({ libraryLoadingStatus: RequestStatus.FAILED }));
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
  fetchLibraryData,
  requestCourseCreatorQuery,
  handleDeleteNotificationQuery,
};
