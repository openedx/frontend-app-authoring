import {
  getCourseOutlineIndex,
} from './api';
import {
  fetchOutlineIndexSuccess,
} from './slice';

// eslint-disable-next-line import/prefer-default-export
export function fetchCourseOutlineIndexQuery(courseId) {
  return async (dispatch) => {
    try {
      const outlineIndex = await getCourseOutlineIndex(courseId);
      dispatch(fetchOutlineIndexSuccess(outlineIndex));
      return true;
    } catch (error) {
      return false;
    }
  };
}
