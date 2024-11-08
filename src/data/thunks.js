import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { addModel } from '../generic/model-store';
import { getCourseDetail, getWaffleFlags } from './api';
import {
  updateStatus,
  updateCanChangeProviders,
  fetchWaffleFlagsSuccess,
} from './slice';
import { RequestStatus } from './constants';

export function fetchCourseDetail(courseId) {
  return async (dispatch) => {
    dispatch(updateStatus({ courseId, status: RequestStatus.IN_PROGRESS }));

    try {
      const courseDetail = await getCourseDetail(courseId, getAuthenticatedUser().username);
      dispatch(updateStatus({ courseId, status: RequestStatus.SUCCESSFUL }));

      dispatch(addModel({ modelType: 'courseDetails', model: courseDetail }));
      dispatch(updateCanChangeProviders({
        canChangeProviders: getAuthenticatedUser().administrator || new Date(courseDetail.start) > new Date(),
      }));
    } catch (error) {
      if (error.response && error.response.status === 404) {
        dispatch(updateStatus({ courseId, status: RequestStatus.NOT_FOUND }));
      } else {
        dispatch(updateStatus({ courseId, status: RequestStatus.FAILED }));
      }
    }
  };
}

export function fetchWaffleFlags(courseId) {
  return async (dispatch) => {
    dispatch(updateStatus({ courseId, status: RequestStatus.IN_PROGRESS }));

    const waffleFlags = await getWaffleFlags(courseId);
    dispatch(updateStatus({ courseId, status: RequestStatus.SUCCESSFUL }));
    dispatch(fetchWaffleFlagsSuccess({ waffleFlags }));
  };
}
