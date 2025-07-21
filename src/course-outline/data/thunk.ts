import { logError } from '@edx/frontend-platform/logging';
import { RequestStatus } from '@src/data/constants';
import { NOTIFICATION_MESSAGES } from '@src/constants';
import {
  hideProcessingNotification,
  showProcessingNotification,
} from '@src/generic/processing-notification/data/slice';
import { createCourseXblock } from '@src/course-unit/data/api';
import { COURSE_BLOCK_NAMES } from '../constants';
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
  dismissNotification, createDiscussionsTopics,
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

/**
 * Action to fetch course outline.
 *
 * @param {string} courseId - ID of the course
 * @returns {Object} - Object containing fetch course outline index query success or failure status
 */
export function fetchCourseOutlineIndexQuery(courseId: string): object {
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
      dispatch(updateStatusBar({
        courseReleaseDate,
        highlightsEnabledForMessaging,
        videoSharingOptions,
        videoSharingEnabled,
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
    } catch (error) {
      return false;
    }
  };
}

export function enableCourseHighlightsEmailsQuery(courseId: string) {
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

export function setVideoSharingOptionQuery(courseId: string, option: string) {
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
export function fetchCourseSectionQuery(sectionIds: string[], scrollToId?: {
  subsectionId: string,
  unitId?: string,
}) {
  return async (dispatch) => {
    dispatch(updateFetchSectionLoadingStatus({ status: RequestStatus.IN_PROGRESS }));
    try {
      const sections = {};
      const results = await Promise.all(sectionIds.map((sectionId) => getCourseItem(sectionId)));
      results.forEach(section => {
        if (scrollToId) {
          const targetSubsection = section?.childInfo?.children?.find(
            subsection => subsection.id === scrollToId.subsectionId,
          );

          if (targetSubsection) {
            if (scrollToId.unitId) {
              const targetUnit = targetSubsection?.childInfo?.children?.find(unit => unit.id === scrollToId.unitId);
              if (targetUnit) {
                targetUnit.shouldScroll = true;
              }
            } else {
              targetSubsection.shouldScroll = true;
            }
          }
        }
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

export function updateCourseSectionHighlightsQuery(sectionId: string, highlights: string[]) {
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

export function publishCourseItemQuery(itemId: string, sectionId: string) {
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

export function configureCourseItemQuery(sectionId: string, configureFn: () => Promise<any>) {
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

export function configureCourseSectionQuery(sectionId: string, isVisibleToStaffOnly: boolean, startDatetime: string) {
  return async (dispatch) => {
    dispatch(configureCourseItemQuery(
      sectionId,
      async () => configureCourseSection(sectionId, isVisibleToStaffOnly, startDatetime),
    ));
  };
}

export function configureCourseSubsectionQuery(
  itemId: string,
  sectionId: string,
  isVisibleToStaffOnly: string,
  releaseDate: string,
  graderType: string,
  dueDate: string,
  isTimeLimited: boolean,
  isProctoredExam: boolean,
  isOnboardingExam: boolean,
  isPracticeExam: boolean,
  examReviewRules: string,
  defaultTimeLimitMin: number,
  hideAfterDue: string,
  showCorrectness: string,
  isPrereq: boolean,
  prereqUsageKey: string,
  prereqMinScore: number,
  prereqMinCompletion: number,
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

export function configureCourseUnitQuery(
  itemId: string,
  sectionId: string,
  isVisibleToStaffOnly: boolean,
  groupAccess: object,
  discussionEnabled: boolean,
) {
  return async (dispatch) => {
    dispatch(configureCourseItemQuery(
      sectionId,
      async () => configureCourseUnit(itemId, isVisibleToStaffOnly, groupAccess, discussionEnabled),
    ));
  };
}

export function editCourseItemQuery(itemId: string, sectionId: string, displayName: string) {
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
 */
function deleteCourseItemQuery(itemId: string, deleteItemFn: () => {}) {
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

export function deleteCourseSectionQuery(sectionId: string) {
  return async (dispatch) => {
    dispatch(deleteCourseItemQuery(
      sectionId,
      () => deleteSection({ itemId: sectionId }),
    ));
  };
}

export function deleteCourseSubsectionQuery(subsectionId: string, sectionId: string) {
  return async (dispatch) => {
    dispatch(deleteCourseItemQuery(
      subsectionId,
      () => deleteSubsection({ itemId: subsectionId, sectionId }),
    ));
  };
}

export function deleteCourseUnitQuery(unitId: string, subsectionId: string, sectionId: string) {
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
 */
function duplicateCourseItemQuery(
  itemId: string,
  parentLocator: string,
  duplicateFn: (locator: string) => Promise<any>,
) {
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

export function duplicateSectionQuery(sectionId: string, courseBlockId: string) {
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

export function duplicateSubsectionQuery(subsectionId: string, sectionId: string) {
  return async (dispatch) => {
    dispatch(duplicateCourseItemQuery(
      subsectionId,
      sectionId,
      async (itemId: string) => dispatch(fetchCourseSectionQuery([sectionId], {
        subsectionId: itemId, // To scroll to the newly duplicated subsection
      })),
    ));
  };
}

export function duplicateUnitQuery(unitId: string, subsectionId: string, sectionId: string) {
  return async (dispatch) => {
    dispatch(duplicateCourseItemQuery(
      unitId,
      subsectionId,
      async (itemId: string) => dispatch(fetchCourseSectionQuery([sectionId], {
        subsectionId,
        unitId: itemId, // To scroll to the newly duplicated unit
      })),
    ));
  };
}

/**
 * Generic function to add any course item. See wrapper functions below for specific implementations.
 */
function addNewCourseItemQuery(
  parentLocator: string,
  category: string,
  displayName: string,
  addItemFn: (data: any) => Promise<any>,
) {
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

export function addNewSectionQuery(parentLocator: string) {
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

export function addNewSubsectionQuery(parentLocator: string) {
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

export function addNewUnitQuery(parentLocator: string, callback: { (locator: any): void }) {
  return async (dispatch) => {
    dispatch(addNewCourseItemQuery(
      parentLocator,
      COURSE_BLOCK_NAMES.vertical.id,
      COURSE_BLOCK_NAMES.vertical.name,
      async (result) => callback(result.locator),
    ));
  };
}

export function addUnitFromLibrary(body: {
  type: string;
  category?: string;
  parentLocator: string;
  displayName?: string;
  boilerplate?: string;
  stagedContent?: string;
  libraryContentKey?: string;
}, callback: (arg0: any) => void) {
  return async (dispatch) => {
    dispatch(updateSavingStatus({ status: RequestStatus.PENDING }));
    dispatch(showProcessingNotification(NOTIFICATION_MESSAGES.saving));

    try {
      await createCourseXblock(body).then(async (result) => {
        if (result) {
          dispatch(updateSavingStatus({ status: RequestStatus.SUCCESSFUL }));
          dispatch(hideProcessingNotification());
          callback(result.locator);
        }
      });
    } catch (error) /* istanbul ignore next */ {
      dispatch(hideProcessingNotification());
      dispatch(updateSavingStatus({ status: RequestStatus.FAILED }));
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

export function pasteClipboardContent(parentLocator: string, sectionId: string) {
  return async (dispatch) => {
    dispatch(updateSavingStatus({ status: RequestStatus.PENDING }));
    dispatch(showProcessingNotification(NOTIFICATION_MESSAGES.pasting));

    try {
      await pasteBlock(parentLocator).then(async (result: any) => {
        if (result) {
          dispatch(fetchCourseSectionQuery([sectionId], { subsectionId: parentLocator, unitId: result.locator }));
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

export function dismissNotificationQuery(url: string) {
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
