import { RequestStatus } from '../../data/constants';
import {
  createOrRerunCourse, getOrganizations, getCourseRerun, getUserPermissions, getUserPermissionsEnabledFlag,
} from './api';
import {
  fetchOrganizations,
  updatePostErrors,
  updateLoadingStatuses,
  updateRedirectUrlObj,
  updateCourseRerunData,
  updateSavingStatus,
  updateUserPermissions,
  updateUserPermissionsEnabled,
} from './slice';

export function fetchOrganizationsQuery() {
  return async (dispatch) => {
    try {
      const organizations = await getOrganizations();
      dispatch(fetchOrganizations(organizations));
      dispatch(updateLoadingStatuses({ organizationLoadingStatus: RequestStatus.SUCCESSFUL }));
    } catch (error) {
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
    } catch (error) {
      dispatch(updateLoadingStatuses({ courseRerunLoadingStatus: RequestStatus.FAILED }));
    }
  };
}

export function updateCreateOrRerunCourseQuery(courseData) {
  return async (dispatch) => {
    dispatch(updateSavingStatus({ status: RequestStatus.PENDING }));

    try {
      const response = await createOrRerunCourse(courseData);
      dispatch(updateRedirectUrlObj('url' in response ? response : {}));
      dispatch(updatePostErrors('errMsg' in response ? response : {}));
      dispatch(updateSavingStatus({ status: RequestStatus.SUCCESSFUL }));
      return true;
    } catch (error) {
      dispatch(updateSavingStatus({ status: RequestStatus.FAILED }));
      return false;
    }
  };
}

export function fetchUserPermissionsQuery(courseId) {
  return async (dispatch) => {
    try {
      const userPermissions = await getUserPermissions(courseId);
      dispatch(updateUserPermissions(userPermissions));
      dispatch(updateLoadingStatuses({ userPermissionsLoadingStatus: RequestStatus.SUCCESSFUL }));
    } catch (error) {
      dispatch(updateLoadingStatuses({ userPermissionsLoadingStatus: RequestStatus.FAILED }));
    }
  };
}

export function fetchUserPermissionsEnabledFlag() {
  return async (dispatch) => {
    try {
      const data = await getUserPermissionsEnabledFlag();
      dispatch(updateUserPermissionsEnabled(data.enabled || false));
      dispatch(updateLoadingStatuses({ userPermissionsEnabledLoadingStatus: RequestStatus.SUCCESSFUL }));
    } catch (error) {
      dispatch(updateUserPermissionsEnabled(false));
      dispatch(updateLoadingStatuses({ userPermissionsEnabledLoadingStatus: RequestStatus.FAILED }));
    }
  };
}
