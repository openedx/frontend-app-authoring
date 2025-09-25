import { RequestStatus } from '../../data/constants';
import {
  getStudioHomeData,
  sendRequestForCourseCreator,
  handleCourseNotification,
  getStudioHomeCoursesV2,
} from './api';
import {
  fetchStudioHomeDataSuccess,
  updateLoadingStatuses,
  updateSavingStatuses,
  fetchCourseDataSuccessV2,
} from './slice';

/**
 * Load both the "Studio Home" data and the course list. Store it in the Redux state.
 *
 * TODO: this should be replaced with two separate React Query hooks - one that calls
 * useQuery() to load the "studio home" data, and another that calls useQuery() to
 * load the course list.
 */
function fetchStudioHomeData(
  search,
  hasHomeData,
  requestParams = {},
  shouldFetchCourses = true,
) {
  return async (dispatch) => {
    dispatch(updateLoadingStatuses({ studioHomeLoadingStatus: RequestStatus.IN_PROGRESS }));

    if (!hasHomeData) {
      try {
        const studioHomeData = await getStudioHomeData();
        dispatch(fetchStudioHomeDataSuccess(studioHomeData));
        dispatch(updateLoadingStatuses({ studioHomeLoadingStatus: RequestStatus.SUCCESSFUL }));
      } catch (error) {
        dispatch(updateLoadingStatuses({ studioHomeLoadingStatus: RequestStatus.FAILED }));
        return;
      }
    }
    if (shouldFetchCourses) {
      dispatch(updateLoadingStatuses({ courseLoadingStatus: RequestStatus.IN_PROGRESS }));
      try {
        const coursesData = await getStudioHomeCoursesV2(search || '', requestParams);
        dispatch(fetchCourseDataSuccessV2(coursesData));
        dispatch(updateLoadingStatuses({ courseLoadingStatus: RequestStatus.SUCCESSFUL }));
      } catch (error) {
        dispatch(updateLoadingStatuses({ courseLoadingStatus: RequestStatus.FAILED }));
      }
    }
  };
}

function fetchOnlyStudioHomeData() {
  // Wrapper function to fetch only studio home data (without fetching courses)
  return fetchStudioHomeData('', false, {}, false, false);
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
  fetchOnlyStudioHomeData,
  requestCourseCreatorQuery,
  handleDeleteNotificationQuery,
};
