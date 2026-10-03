import { RequestStatus } from '../../data/constants';
import {
  fetchOrganizations,
  updatePostErrors,
  updateLoadingStatuses,
  updateRedirectUrlObj,
  updateCourseRerunData,
  updateSavingStatus,
} from './slice';
import {
  createOrRerunCourse,
  getOrganizations,
  getCourseRerun,
} from './api';

export function fetchOrganizationsQuery() {
  return async (dispatch) => {
    try {
      const organizations = await getOrganizations();
      dispatch(fetchOrganizations(organizations));
      dispatch(updateLoadingStatuses({ organizationLoadingStatus: RequestStatus.SUCCESSFUL }));
    } catch {
      dispatch(updateLoadingStatuses({ organizationLoadingStatus: RequestStatus.FAILED }));
    }
  };
}

export function fetchCourseRerunQuery(courseId) {
  return async (dispatch) => {
    try {
      const courseRerun = await getCourseRerun(courseId);
      dispatch(updateCourseRerunData(courseRerun));
      dispatch(updateLoadingStatuses({ courseRerunLoadingStatus: RequestStatus.SUCCESSFUL }));
    } catch {
      dispatch(updateLoadingStatuses({ courseRerunLoadingStatus: RequestStatus.FAILED }));
    }
  };
}

export function updateCreateOrRerunCourseQuery(courseData, isRerun = false) {
  return async (dispatch) => {
    dispatch(updateSavingStatus({ status: RequestStatus.PENDING }));

    try {
      const response = await createOrRerunCourse(courseData);
      const responseObj = response && typeof response === 'object' ? response : {};
      if (responseObj.errMsg) {
        dispatch(updatePostErrors(responseObj));
        dispatch(updateSavingStatus({ status: RequestStatus.FAILED }));
        return false;
      }
      if (isRerun) {
        dispatch(updateRedirectUrlObj({ url: '/home' }));
      } else {
        dispatch(updateRedirectUrlObj('url' in responseObj ? responseObj : {}));
      }
      dispatch(updatePostErrors('errMsg' in responseObj ? responseObj : {}));
      dispatch(updateSavingStatus({ status: RequestStatus.SUCCESSFUL }));
      return true;
    } catch (error) {
      const responseData = error?.response?.data || {};
      const errMsg = responseData?.errMsg
        || responseData?.error
        || responseData?.detail
        || error?.message
        || 'Course creation is taking longer than expected. The course may still finish in the background; refresh Studio before retrying.';
      dispatch(updatePostErrors({ errMsg }));
      dispatch(updateSavingStatus({ status: RequestStatus.FAILED }));
      return false;
    }
  };
}
