import { createSelector } from 'reselect';
import { STORE_NAMES } from '../../common/data';

const stateSelector = state => ({ ...state[STORE_NAMES.COURSE_IMPORT] });

const selectCourseImport = createSelector(
  stateSelector,
  (state) => ({
    ...state,
    errorMessage: state.errorMessage,
    courses: state.courses,
    courseCount: state.courseCount,
    importTasks: state.importTasks,
    importTaskCount: state.importTaskCount,
    ongoingImports: state.ongoingImports,
    importBlocksLoadingStatus: state.importBlocksLoadingStatus,
    coursesLoadingStatus: state.coursesLoadingStatus,
    organizationsLoadingStatus: state.organizationsLoadingStatus,
  }),
);

export default selectCourseImport;
