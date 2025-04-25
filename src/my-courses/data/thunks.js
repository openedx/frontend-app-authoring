/* eslint-disable linebreak-style */
import { RequestStatus } from '../../data/constants';
import {
  getMyCoursesData,
  sendRequestForCourseCreator,
  handleCourseNotification,
  getStudioHomeCourses,
  getStudioHomeLibraries,
  getMyCoursesV2,
} from './api';
import {
  fetchMyCoursesDataSuccess,
  fetchCourseDataSuccess,
  updateLoadingStatuses,
  updateSavingStatuses,
  fetchLibraryDataSuccess,
  fetchCourseDataSuccessV2,
} from './slice';

function fetchMyCoursesData(search, hasHomeData, requestParams = {}, isPaginationEnabled = false) {
  return async (dispatch) => {
    dispatch(updateLoadingStatuses({ myCoursesLoadingStatus: RequestStatus.IN_PROGRESS }));
    dispatch(updateLoadingStatuses({ courseLoadingStatus: RequestStatus.IN_PROGRESS }));

    if (!hasHomeData) {
      try {
        const myCoursesData = await getMyCoursesData();
        dispatch(fetchMyCoursesDataSuccess(myCoursesData));
        dispatch(updateLoadingStatuses({ myCoursesLoadingStatus: RequestStatus.SUCCESSFUL }));
      } catch (error) {
        dispatch(updateLoadingStatuses({ myCoursesLoadingStatus: RequestStatus.FAILED }));
        return;
      }
    }
    try {
      if (isPaginationEnabled) {
        const coursesData = await getMyCoursesV2(search || '', requestParams);
        dispatch(fetchCourseDataSuccessV2(coursesData));
      } else {
        const coursesData = await getStudioHomeCourses(search || '');
        dispatch(fetchCourseDataSuccess(coursesData));
      }

      dispatch(updateLoadingStatuses({ courseLoadingStatus: RequestStatus.SUCCESSFUL }));
    } catch (error) {
      dispatch(updateLoadingStatuses({ courseLoadingStatus: RequestStatus.FAILED }));
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
  fetchMyCoursesData,
  fetchLibraryData,
  requestCourseCreatorQuery,
  handleDeleteNotificationQuery,
};
