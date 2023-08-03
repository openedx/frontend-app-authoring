import {
  getCourseOutlineIndex,
} from './api';
import {
  fetchOutlineIndexSuccess,
  updateLoadingOutlineIndexStatus,
} from './slice';
import { RequestStatus } from '../../data/constants';

// eslint-disable-next-line import/prefer-default-export
export function fetchCourseOutlineIndexQuery(courseId) {
  return async (dispatch) => {
    dispatch(updateLoadingOutlineIndexStatus({ status: RequestStatus.IN_PROGRESS }));

    try {
      const outlineIndex = await getCourseOutlineIndex(courseId);
      dispatch(fetchOutlineIndexSuccess(outlineIndex));

      dispatch(updateLoadingOutlineIndexStatus({ status: RequestStatus.SUCCESSFUL }));
      return true;
    } catch (error) {
      dispatch(updateLoadingOutlineIndexStatus({ status: RequestStatus.FAILED }));
      return false;
    }
  };
}
