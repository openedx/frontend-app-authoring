import { RequestStatus } from '../../data/constants';
import { updateClipboardData } from '../../generic/data/slice';
import { NOTIFICATION_MESSAGES } from '../../constants';
import { COURSE_BLOCK_NAMES } from '../constants';
import {
  hideProcessingNotification,
  showProcessingNotification,
} from '../../generic/processing-notification/data/slice';
import {
  getCourseBestPracticesChecklist,
  getCourseLaunchChecklist,
} from '../utils/getChecklistForStatusBar';
import { getErrorDetails } from '../utils/getErrorDetails';
import {
  addNewCourseItem,
  deleteCourseItem,
  duplicateCourseItem,
  editItemDisplayName,
  enableCourseHighlightsEmails,
  getCourseBestPractices,
  getCourseLaunch,
  getCourseOutlineIndex,
  getCourseItem,
  publishCourseSection,
  configureCourseSection,
  configureCourseSubsection,
  configureCourseUnit,
  restartIndexingOnCourse,
  updateCourseSectionHighlights,
  setSectionOrderList,
  setVideoSharingOption,
  setCourseItemOrderList,
  pasteBlock,
  dismissNotification,
} from './api';
import {
  addSection,
  addSubsection,
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
  deleteSection,
  deleteSubsection,
  deleteUnit,
  duplicateSection,
  reorderSectionList,
  setPasteFileNotices,
  updateCourseLaunchQueryStatus,
} from './slice';

export function fetchCourseOutlineIndexQuery(courseId) {
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
        },
      } = outlineIndex;
      dispatch(fetchOutlineIndexSuccess(outlineIndex));
      dispatch(updateClipboardData(outlineIndex.initialUserClipboard));
      dispatch(updateStatusBar({
        courseReleaseDate,
        highlightsEnabledForMessaging,
        videoSharingOptions,
        videoSharingEnabled,
      }));
      dispatch(updateCourseActions(actions));

      dispatch(updateOutlineIndexLoadingStatus({ status: RequestStatus.SUCCESSFUL }));
    } catch (error) {
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
    } catch (error) {
      return false;
    }
  };
}

export function enableCourseHighlightsEmailsQuery(courseId) {
  return async (dispatch) => {
    dispatch(updateSavingStatus({ status: RequestStatus.PENDING }));
    dispatch(showProcessingNotification(NOTIFICATION_MESSAGES.saving));

    try {
      await enableCourseHighlightsEmails(courseId);
      dispatch(fetchCourseOutlineIndexQuery(courseId));

      dispatch(updateSavingStatus({ status: RequestStatus.SUCCESSFUL }));
      dispatch(hideProcessingNotification());
    } catch (error) {
      dispatch(updateSavingStatus({ status: RequestStatus.FAILED }));
    }
  };
}

export function setVideoSharingOptionQuery(courseId, option) {
  return async (dispatch) => {
    dispatch(updateSavingStatus({ status: RequestStatus.PENDING }));
    dispatch(showProcessingNotification(NOTIFICATION_MESSAGES.saving));

    try {
      await setVideoSharingOption(courseId, option);
      dispatch(updateStatusBar({ videoSharingOptions: option }));

      dispatch(updateSavingStatus({ status: RequestStatus.SUCCESSFUL }));
      dispatch(hideProcessingNotification());
    } catch (error) {
      dispatch(updateSavingStatus({ status: RequestStatus.FAILED }));
      dispatch(hideProcessingNotification());
    }
  };
}

export function fetchCourseReindexQuery(courseId, reindexLink) {
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

export function fetchCourseSectionQuery(sectionIds, shouldScroll = false) {
  return async (dispatch) => {
    dispatch(updateFetchSectionLoadingStatus({ status: RequestStatus.IN_PROGRESS }));
    try {
      const sections = {};
      const results = await Promise.all(sectionIds.map((sectionId) => getCourseItem(sectionId)));
      results.forEach((data) => {
        // eslint-disable-next-line no-param-reassign
        data.shouldScroll = shouldScroll;
        sections[data.id] = data;
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

export function updateCourseSectionHighlightsQuery(sectionId, highlights) {
  return async (dispatch) => {
    dispatch(updateSavingStatus({ status: RequestStatus.PENDING }));
    dispatch(showProcessingNotification(NOTIFICATION_MESSAGES.saving));

    try {
      await updateCourseSectionHighlights(sectionId, highlights).then(async (result) => {
        if (result) {
          await dispatch(fetchCourseSectionQuery([sectionId]));
          dispatch(updateSavingStatus({ status: RequestStatus.SUCCESSFUL }));
          dispatch(hideProcessingNotification());
        }
      });
    } catch (error) {
      dispatch(hideProcessingNotification());
      dispatch(updateSavingStatus({ status: RequestStatus.FAILED }));
    }
  };
}

export function publishCourseItemQuery(itemId, sectionId) {
  return async (dispatch) => {
    dispatch(updateSavingStatus({ status: RequestStatus.PENDING }));
    dispatch(showProcessingNotification(NOTIFICATION_MESSAGES.saving));

    try {
      await publishCourseSection(itemId).then(async (result) => {
        if (result) {
          await dispatch(fetchCourseSectionQuery([sectionId]));
          dispatch(hideProcessingNotification());
          dispatch(updateSavingStatus({ status: RequestStatus.SUCCESSFUL }));
        }
      });
    } catch (error) {
      dispatch(hideProcessingNotification());
      dispatch(updateSavingStatus({ status: RequestStatus.FAILED }));
    }
  };
}

export function configureCourseItemQuery(sectionId, configureFn) {
  return async (dispatch) => {
    dispatch(updateSavingStatus({ status: RequestStatus.PENDING }));
    dispatch(showProcessingNotification(NOTIFICATION_MESSAGES.saving));

    try {
      await configureFn().then(async (result) => {
        if (result) {
          await dispatch(fetchCourseSectionQuery([sectionId]));
          dispatch(hideProcessingNotification());
          dispatch(updateSavingStatus({ status: RequestStatus.SUCCESSFUL }));
        }
      });
    } catch (error) {
      dispatch(hideProcessingNotification());
      dispatch(updateSavingStatus({ status: RequestStatus.FAILED }));
    }
  };
}

export function configureCourseSectionQuery(sectionId, isVisibleToStaffOnly, startDatetime) {
  return async (dispatch) => {
    dispatch(configureCourseItemQuery(
      sectionId,
      async () => configureCourseSection(sectionId, isVisibleToStaffOnly, startDatetime),
    ));
  };
}

export function configureCourseSubsectionQuery(
  itemId,
  sectionId,
  isVisibleToStaffOnly,
  releaseDate,
  graderType,
  dueDate,
  isTimeLimited,
  isProctoredExam,
  isOnboardingExam,
  isPracticeExam,
  examReviewRules,
  defaultTimeLimitMin,
  hideAfterDue,
  showCorrectness,
  isPrereq,
  prereqUsageKey,
  prereqMinScore,
  prereqMinCompletion,
) {
  return async (dispatch) => {
    dispatch(configureCourseItemQuery(
      sectionId,
      async () => configureCourseSubsection(
        itemId,
        isVisibleToStaffOnly,
        releaseDate,
        graderType,
        dueDate,
        isTimeLimited,
        isProctoredExam,
        isOnboardingExam,
        isPracticeExam,
        examReviewRules,
        defaultTimeLimitMin,
        hideAfterDue,
        showCorrectness,
        isPrereq,
        prereqUsageKey,
        prereqMinScore,
        prereqMinCompletion,
      ),
    ));
  };
}

export function configureCourseUnitQuery(itemId, sectionId, isVisibleToStaffOnly, groupAccess, discussionEnabled) {
  return async (dispatch) => {
    dispatch(configureCourseItemQuery(
      sectionId,
      async () => configureCourseUnit(itemId, isVisibleToStaffOnly, groupAccess, discussionEnabled),
    ));
  };
}

export function editCourseItemQuery(itemId, sectionId, displayName) {
  return async (dispatch) => {
    dispatch(updateSavingStatus({ status: RequestStatus.PENDING }));
    dispatch(showProcessingNotification(NOTIFICATION_MESSAGES.saving));

    try {
      await editItemDisplayName(itemId, displayName).then(async (result) => {
        if (result) {
          await dispatch(fetchCourseSectionQuery([sectionId]));
          dispatch(hideProcessingNotification());
          dispatch(updateSavingStatus({ status: RequestStatus.SUCCESSFUL }));
        }
      });
    } catch (error) {
      dispatch(hideProcessingNotification());
      dispatch(updateSavingStatus({ status: RequestStatus.FAILED }));
    }
  };
}

/**
 * Generic function to delete course item, see below wrapper funcs for specific implementations.
 * @param {string} itemId
 * @param {() => {}} deleteItemFn
 * @returns {}
 */
function deleteCourseItemQuery(itemId, deleteItemFn) {
  return async (dispatch) => {
    dispatch(updateSavingStatus({ status: RequestStatus.PENDING }));
    dispatch(showProcessingNotification(NOTIFICATION_MESSAGES.deleting));

    try {
      await deleteCourseItem(itemId);
      dispatch(deleteItemFn());
      dispatch(hideProcessingNotification());
      dispatch(updateSavingStatus({ status: RequestStatus.SUCCESSFUL }));
    } catch (error) {
      dispatch(hideProcessingNotification());
      dispatch(updateSavingStatus({ status: RequestStatus.FAILED }));
    }
  };
}

export function deleteCourseSectionQuery(sectionId) {
  return async (dispatch) => {
    dispatch(deleteCourseItemQuery(
      sectionId,
      () => deleteSection({ itemId: sectionId }),
    ));
  };
}

export function deleteCourseSubsectionQuery(subsectionId, sectionId) {
  return async (dispatch) => {
    dispatch(deleteCourseItemQuery(
      subsectionId,
      () => deleteSubsection({ itemId: subsectionId, sectionId }),
    ));
  };
}

export function deleteCourseUnitQuery(unitId, subsectionId, sectionId) {
  return async (dispatch) => {
    dispatch(deleteCourseItemQuery(
      unitId,
      () => deleteUnit({ itemId: unitId, subsectionId, sectionId }),
    ));
  };
}

/**
 * Generic function to duplicate any course item. See wrapper functions below for specific implementations.
 * @param {string} itemId
 * @param {string} parentLocator
 * @param {(locator) => Promise<any>} duplicateFn
 * @returns {}
 */
function duplicateCourseItemQuery(itemId, parentLocator, duplicateFn) {
  return async (dispatch) => {
    dispatch(updateSavingStatus({ status: RequestStatus.PENDING }));
    dispatch(showProcessingNotification(NOTIFICATION_MESSAGES.duplicating));

    try {
      await duplicateCourseItem(itemId, parentLocator).then(async (result) => {
        if (result) {
          await duplicateFn(result.locator);
          dispatch(hideProcessingNotification());
          dispatch(updateSavingStatus({ status: RequestStatus.SUCCESSFUL }));
        }
      });
    } catch (error) {
      dispatch(hideProcessingNotification());
      dispatch(updateSavingStatus({ status: RequestStatus.FAILED }));
    }
  };
}

export function duplicateSectionQuery(sectionId, courseBlockId) {
  return async (dispatch) => {
    dispatch(duplicateCourseItemQuery(
      sectionId,
      courseBlockId,
      async (locator) => {
        const duplicatedItem = await getCourseItem(locator);
        // Page should scroll to newly duplicated item.
        duplicatedItem.shouldScroll = true;
        dispatch(duplicateSection({ id: sectionId, duplicatedItem }));
      },
    ));
  };
}

export function duplicateSubsectionQuery(subsectionId, sectionId) {
  return async (dispatch) => {
    dispatch(duplicateCourseItemQuery(
      subsectionId,
      sectionId,
      async () => dispatch(fetchCourseSectionQuery([sectionId], true)),
    ));
  };
}

export function duplicateUnitQuery(unitId, subsectionId, sectionId) {
  return async (dispatch) => {
    dispatch(duplicateCourseItemQuery(
      unitId,
      subsectionId,
      async () => dispatch(fetchCourseSectionQuery([sectionId], true)),
    ));
  };
}

/**
 * Generic function to add any course item. See wrapper functions below for specific implementations.
 * @param {string} parentLocator
 * @param {string} category
 * @param {string} displayName
 * @param {(data) => {}} addItemFn
 * @returns {}
 */
function addNewCourseItemQuery(parentLocator, category, displayName, addItemFn) {
  return async (dispatch) => {
    dispatch(updateSavingStatus({ status: RequestStatus.PENDING }));
    dispatch(showProcessingNotification(NOTIFICATION_MESSAGES.saving));

    try {
      await addNewCourseItem(
        parentLocator,
        category,
        displayName,
      ).then(async (result) => {
        if (result) {
          await addItemFn(result);
          dispatch(updateSavingStatus({ status: RequestStatus.SUCCESSFUL }));
          dispatch(hideProcessingNotification());
        }
      });
    } catch (error) {
      dispatch(hideProcessingNotification());
      dispatch(updateSavingStatus({ status: RequestStatus.FAILED }));
    }
  };
}

export function addNewSectionQuery(parentLocator) {
  return async (dispatch) => {
    dispatch(addNewCourseItemQuery(
      parentLocator,
      COURSE_BLOCK_NAMES.chapter.id,
      COURSE_BLOCK_NAMES.chapter.name,
      async (result) => {
        const data = await getCourseItem(result.locator);
        // Page should scroll to newly created section.
        data.shouldScroll = true;
        dispatch(addSection(data));
      },
    ));
  };
}

export function addNewSubsectionQuery(parentLocator) {
  return async (dispatch) => {
    dispatch(addNewCourseItemQuery(
      parentLocator,
      COURSE_BLOCK_NAMES.sequential.id,
      COURSE_BLOCK_NAMES.sequential.name,
      async (result) => {
        const data = await getCourseItem(result.locator);
        // Page should scroll to newly created subsection.
        data.shouldScroll = true;
        dispatch(addSubsection({ parentLocator, data }));
      },
    ));
  };
}

export function addNewUnitQuery(parentLocator, callback) {
  return async (dispatch) => {
    dispatch(addNewCourseItemQuery(
      parentLocator,
      COURSE_BLOCK_NAMES.vertical.id,
      COURSE_BLOCK_NAMES.vertical.name,
      async (result) => callback(result.locator),
    ));
  };
}

function setBlockOrderListQuery(
  parentId,
  blockIds,
  apiFn,
  restoreCallback,
  successCallback,
) {
  return async (dispatch) => {
    dispatch(updateSavingStatus({ status: RequestStatus.PENDING }));
    dispatch(showProcessingNotification(NOTIFICATION_MESSAGES.saving));

    try {
      await apiFn(parentId, blockIds).then(async (result) => {
        if (result) {
          successCallback();
          dispatch(updateSavingStatus({ status: RequestStatus.SUCCESSFUL }));
          dispatch(hideProcessingNotification());
        }
      });
    } catch (error) {
      restoreCallback();
      dispatch(hideProcessingNotification());
      dispatch(updateSavingStatus({ status: RequestStatus.FAILED }));
    }
  };
}

export function setSectionOrderListQuery(courseId, sectionListIds, restoreCallback) {
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
  sectionId,
  prevSectionId,
  subsectionListIds,
  restoreCallback,
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
  sectionId,
  subsectionId,
  prevSectionId,
  unitListIds,
  restoreCallback,
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

export function pasteClipboardContent(parentLocator, sectionId) {
  return async (dispatch) => {
    dispatch(updateSavingStatus({ status: RequestStatus.PENDING }));
    dispatch(showProcessingNotification(NOTIFICATION_MESSAGES.pasting));

    try {
      await pasteBlock(parentLocator).then(async (result) => {
        if (result) {
          dispatch(fetchCourseSectionQuery([sectionId], true));
          dispatch(updateSavingStatus({ status: RequestStatus.SUCCESSFUL }));
          dispatch(hideProcessingNotification());
          dispatch(setPasteFileNotices(result?.staticFileNotices));
        }
      });
    } catch (error) {
      dispatch(hideProcessingNotification());
      dispatch(updateSavingStatus({ status: RequestStatus.FAILED }));
    }
  };
}

export function dismissNotificationQuery(url) {
  return async (dispatch) => {
    dispatch(updateSavingStatus({ status: RequestStatus.PENDING }));

    try {
      await dismissNotification(url).then(async () => {
        dispatch(updateSavingStatus({ status: RequestStatus.SUCCESSFUL }));
      });
    } catch (error) {
      dispatch(updateSavingStatus({ status: RequestStatus.FAILED }));
    }
  };
}
