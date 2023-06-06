import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { addModel } from '../generic/model-store';
import { getCourseDetail } from './api';
import {
  updateStatus,
  updateCanChangeProviders,
} from './slice';
import { RequestStatus } from './constants';

/* eslint-disable import/prefer-default-export */
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
      dispatch(updateStatus({ courseId, status: RequestStatus.FAILED }));
    }
  };
}
