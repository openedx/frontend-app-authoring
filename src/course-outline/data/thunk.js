import { RequestStatus } from '../../data/constants';
import {
  getCourseBestPracticesChecklist,
  getCourseLaunchChecklist,
} from '../utils/getChecklistForStatusBar';
import {
  enableCourseHighlightsEmails,
  getCourseBestPractices,
  getCourseLaunch,
  getCourseOutlineIndex,
} from './api';
import {
  fetchOutlineIndexSuccess,
  updateLoadingOutlineIndexStatus,
  updateStatusBar,
  fetchStatusBarChecklistSuccess,
  fetchStatusBarSelPacedSuccess,
  updateSavingStatus,
} from './slice';

export function fetchCourseOutlineIndexQuery(courseId) {
  return async (dispatch) => {
    dispatch(updateLoadingOutlineIndexStatus({ status: RequestStatus.IN_PROGRESS }));

    try {
      const outlineIndex = await getCourseOutlineIndex(courseId);
      const { courseReleaseDate, courseStructure: { highlightsEnabledForMessaging, highlightsDocUrl } } = outlineIndex;
      dispatch(fetchOutlineIndexSuccess(outlineIndex));
      dispatch(updateStatusBar({ courseReleaseDate, highlightsEnabledForMessaging, highlightsDocUrl }));

      dispatch(updateLoadingOutlineIndexStatus({ status: RequestStatus.SUCCESSFUL }));
      return true;
    } catch (error) {
      dispatch(updateLoadingOutlineIndexStatus({ status: RequestStatus.FAILED }));
      return false;
    }
  };
}

export function fetchCourseLaunchQuery({
  courseId,
  gradedOnly = true,
  validateOras = true,
  all = true,
}) {
  return async (dispatch) => {
    try {
      const data = await getCourseLaunch({
        courseId, gradedOnly, validateOras, all,
      });
      dispatch(fetchStatusBarSelPacedSuccess({ isSelfPaced: data.isSelfPaced }));
      dispatch(fetchStatusBarChecklistSuccess(getCourseLaunchChecklist(data)));

      return true;
    } catch (error) {
      return false;
    }
  };
}

export function fetchCourseBestPracticesQuery({
  courseId,
  excludeGraded = true,
  all = true,
}) {
  return async (dispatch) => {
    try {
      const data = await getCourseBestPractices({ courseId, excludeGraded, all });
      dispatch(fetchStatusBarChecklistSuccess(getCourseBestPracticesChecklist(data)));

      return true;
    } catch (error) {
      return false;
    }
  };
}

export function enableCourseHighlightsEmailsQuery(courseId) {
  return async (dispatch) => {
    dispatch(updateSavingStatus({ status: RequestStatus.PENDING }));

    try {
      await enableCourseHighlightsEmails(courseId);
      dispatch(fetchCourseOutlineIndexQuery(courseId));

      dispatch(updateSavingStatus({ status: RequestStatus.SUCCESSFUL }));
      return true;
    } catch (error) {
      dispatch(updateSavingStatus({ status: RequestStatus.FAILED }));
      return false;
    }
  };
}
