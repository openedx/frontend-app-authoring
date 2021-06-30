import { createSelector } from 'reselect';
import { STORE_NAMES } from '../../common/data';

const stateSelector = state => ({ ...state[STORE_NAMES.COURSE_IMPORT] });

const selectCourseImport = createSelector(
  stateSelector,
);

export default selectCourseImport;
