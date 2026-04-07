import { logError } from '@edx/frontend-platform/logging';
import { RequestStatus } from '@src/data/constants';
import { NOTIFICATION_MESSAGES } from '@src/constants';
import { showToastOutsideReact, closeToastOutsideReact } from '@src/generic/toast-context';
import {
  getCourseBestPracticesChecklist,
  getCourseLaunchChecklist,
} from '../utils/getChecklistForStatusBar';
import { getErrorDetails } from '../utils/getErrorDetails';
import {
  enableCourseHighlightsEmails,
  getCourseBestPractices,
  getCourseLaunch,
  getCourseOutlineIndex,
  getCourseItem,
  restartIndexingOnCourse,
  setSectionOrderList,
  setVideoSharingOption,
  setCourseItemOrderList,
  dismissNotification, createDiscussionsTopics,
} from './api';
import {
  fetchOutlineIndexSuccess,
  updateOutlineIndexLoadingStatus,
  updateReindexLoadingStatus,
  updateStatusBar,
  updateCourseActions,
  fetchStatusBarChecklistSuccess,
  fetchStatusBarSelfPacedSuccess,
  updateSavingStatus,
  updateSectionList,
  updateFetchSectionLoadingStatus,
  reorderSectionList,
  updateCourseLaunchQueryStatus,
} from './slice';

/**
 * Action to fetch course outline.
 *
 * @param {string} courseId - ID of the course
 * @returns {Object} - Object containing fetch course outline index query success or failure status
 */
export function fetchCourseOutlineIndexQuery(courseId: string): (dispatch: any) => Promise<void> {
  return async (dispatch) => {
    dispatch(updateOutlineIndexLoadingStatus({ status: RequestStatus.IN_PROGRESS }));

    try {
      const outlineIndex = await getCourseOutlineIndex(courseId);
      const {
        courseReleaseDate,
        courseStructure: {
          highlightsEnabledForMessaging,
          videoSharingEnabled,
          videoSharingOptions,
          actions,
          end,
          hasChanges,
        },
      } = outlineIndex;
      dispatch(fetchOutlineIndexSuccess(outlineIndex));
      dispatch(updateStatusBar({
        courseReleaseDate,
        highlightsEnabledForMessaging,
        videoSharingOptions,
        videoSharingEnabled,
        endDate: end,
        hasChanges,
      }));
      dispatch(updateCourseActions(actions));

      dispatch(updateOutlineIndexLoadingStatus({ status: RequestStatus.SUCCESSFUL }));
    } catch (error: any) {
      if (error.response && error.response.status === 403) {
        dispatch(updateOutlineIndexLoadingStatus({
          status: RequestStatus.DENIED,
        }));
      } else {
        dispatch(updateOutlineIndexLoadingStatus({
          status: RequestStatus.FAILED,
          errors: getErrorDetails(error, false),
        }));
      }
    }
  };
}

export function syncDiscussionsTopics(courseId: string) {
  return async () => {
    try {
      await createDiscussionsTopics(courseId);
    } catch (error) {
      logError(error);
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
    dispatch(updateCourseLaunchQueryStatus({ status: RequestStatus.IN_PROGRESS }));
    try {
      const data = await getCourseLaunch({
        courseId, gradedOnly, validateOras, all,
      });
      dispatch(fetchStatusBarSelfPacedSuccess({ isSelfPaced: data.isSelfPaced }));
      dispatch(fetchStatusBarChecklistSuccess(getCourseLaunchChecklist(data)));

      dispatch(updateCourseLaunchQueryStatus({ status: RequestStatus.SUCCESSFUL }));
    } catch (error) {
      dispatch(updateCourseLaunchQueryStatus({
        status: RequestStatus.FAILED,
        errors: getErrorDetails(error),
      }));
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
    } catch {
      return false;
    }
  };
}

export function enableCourseHighlightsEmailsQuery(courseId: string) {
  return async (dispatch) => {
    dispatch(updateSavingStatus({ status: RequestStatus.PENDING }));
    showToastOutsideReact(NOTIFICATION_MESSAGES.saving);

    try {
      await enableCourseHighlightsEmails(courseId);
      dispatch(fetchCourseOutlineIndexQuery(courseId));

      dispatch(updateSavingStatus({ status: RequestStatus.SUCCESSFUL }));
    } catch {
      dispatch(updateSavingStatus({ status: RequestStatus.FAILED }));
    } finally {
      closeToastOutsideReact();
    }
  };
}

export function setVideoSharingOptionQuery(courseId: string, option: string) {
  return async (dispatch) => {
    dispatch(updateSavingStatus({ status: RequestStatus.PENDING }));
    showToastOutsideReact(NOTIFICATION_MESSAGES.saving);

    try {
      await setVideoSharingOption(courseId, option);
      dispatch(updateStatusBar({ videoSharingOptions: option }));

      dispatch(updateSavingStatus({ status: RequestStatus.SUCCESSFUL }));
    } catch {
      dispatch(updateSavingStatus({ status: RequestStatus.FAILED }));
    } finally {
      closeToastOutsideReact();
    }
  };
}

export function fetchCourseReindexQuery(reindexLink: string) {
  return async (dispatch) => {
    dispatch(updateReindexLoadingStatus({ status: RequestStatus.IN_PROGRESS }));

    try {
      await restartIndexingOnCourse(reindexLink);
      dispatch(updateReindexLoadingStatus({ status: RequestStatus.SUCCESSFUL }));
    } catch (error) {
      dispatch(updateReindexLoadingStatus({
        status: RequestStatus.FAILED,
        errors: getErrorDetails(error),
      }));
    }
  };
}

/**
 * Fetches course sections and optionally scrolls to a specific subsection/unit.
 */
export function fetchCourseSectionQuery(sectionIds: string[]) {
  return async (dispatch) => {
    dispatch(updateFetchSectionLoadingStatus({ status: RequestStatus.IN_PROGRESS }));
    try {
      const sections = {};
      const results = await Promise.all(sectionIds.map((sectionId) => getCourseItem(sectionId)));
      results.forEach(section => {
        sections[section.id] = section;
      });
      dispatch(updateSectionList(sections));
      dispatch(updateFetchSectionLoadingStatus({ status: RequestStatus.SUCCESSFUL }));
    } catch (error) {
      dispatch(updateFetchSectionLoadingStatus({
        status: RequestStatus.FAILED,
        errors: getErrorDetails(error),
      }));
    }
  };
}

function setBlockOrderListQuery(
  parentId: string,
  blockIds: string[],
  apiFn: {
    (courseId: string, children: string[]): Promise<object>;
    (itemId: string, children: string[]): Promise<object>;
    (itemId: string, children: string[]): Promise<object>;
    (arg0: any, arg1: any): Promise<any>;
  },
  restoreCallback: () => void,
  successCallback: { (): any; (): void; (): void; (): void; },
) {
  return async (dispatch) => {
    dispatch(updateSavingStatus({ status: RequestStatus.PENDING }));
    showToastOutsideReact(NOTIFICATION_MESSAGES.saving);

    try {
      await apiFn(parentId, blockIds).then(async (result) => {
        if (result) {
          successCallback();
          dispatch(updateSavingStatus({ status: RequestStatus.SUCCESSFUL }));
        }
      });
    } catch {
      restoreCallback();
      dispatch(updateSavingStatus({ status: RequestStatus.FAILED }));
    } finally {
      closeToastOutsideReact();
    }
  };
}

export function setSectionOrderListQuery(
  courseId: string,
  sectionListIds: string[],
  restoreCallback: () => void,
) {
  return async (dispatch) => {
    dispatch(setBlockOrderListQuery(
      courseId,
      sectionListIds,
      setSectionOrderList,
      restoreCallback,
      () => dispatch(reorderSectionList(sectionListIds)),
    ));
  };
}

export function setSubsectionOrderListQuery(
  sectionId: string,
  prevSectionId: string,
  subsectionListIds: string[],
  restoreCallback: () => void,
) {
  return async (dispatch) => {
    dispatch(setBlockOrderListQuery(
      sectionId,
      subsectionListIds,
      setCourseItemOrderList,
      restoreCallback,
      () => {
        const sectionIds = [sectionId];
        if (prevSectionId && prevSectionId !== sectionId) {
          sectionIds.push(prevSectionId);
        }
        dispatch(fetchCourseSectionQuery(sectionIds));
      },
    ));
  };
}

export function setUnitOrderListQuery(
  sectionId: string,
  subsectionId: string,
  prevSectionId: string,
  unitListIds: string[],
  restoreCallback: () => void,
) {
  return async (dispatch) => {
    dispatch(setBlockOrderListQuery(
      subsectionId,
      unitListIds,
      setCourseItemOrderList,
      restoreCallback,
      () => {
        const sectionIds = [sectionId];
        if (prevSectionId && prevSectionId !== sectionId) {
          sectionIds.push(prevSectionId);
        }
        dispatch(fetchCourseSectionQuery(sectionIds));
      },
    ));
  };
}

export function dismissNotificationQuery(url: string) {
  return async (dispatch) => {
    dispatch(updateSavingStatus({ status: RequestStatus.PENDING }));

    try {
      await dismissNotification(url).then(async () => {
        dispatch(updateSavingStatus({ status: RequestStatus.SUCCESSFUL }));
      });
    } catch {
      dispatch(updateSavingStatus({ status: RequestStatus.FAILED }));
    }
  };
}
