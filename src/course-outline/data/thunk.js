import {
  getCourseOutlineIndex,
} from './api';
import {
  fetchOutlineIndexSuccess,
} from './slice';
import { courseOutlineIndexMock } from '../__mocks__';

// eslint-disable-next-line import/prefer-default-export
export function fetchCourseOutlineIndexQuery(courseId) {
  return async (dispatch) => {
    try {
      // const outlineIndex = await getCourseOutlineIndex(courseId);
      dispatch(fetchOutlineIndexSuccess(courseOutlineIndexMock));
      return true;
    } catch (error) {
      return false;
    }
  };
}
