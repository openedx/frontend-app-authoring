import { logError, logInfo } from '@edx/frontend-platform/logging';

import {
  hideProcessingNotification,
  showProcessingNotification,
} from '../../generic/processing-notification/data/slice';
import { RequestStatus } from '../../data/constants';
import { NOTIFICATION_MESSAGES } from '../../constants';
import {
  addModel, updateModel, updateModels, updateModelsMap, addModelsMap,
} from '../../generic/model-store';
import {
  getCourseUnitData,
  editUnitDisplayName,
  getCourseMetadata,
  getLearningSequencesOutline,
  getCourseHomeCourseMetadata,
  getCourseSectionVerticalData,
  createCourseXblock,
  getCourseVerticalChildren,
  handleCourseUnitVisibilityAndData,
  deleteUnitItem,
  duplicateUnitItem,
} from './api';
import {
  updateLoadingCourseUnitStatus,
  fetchCourseItemSuccess,
  updateSavingStatus,
  fetchSequenceRequest,
  fetchSequenceFailure,
  fetchSequenceSuccess,
  fetchCourseRequest,
  fetchCourseSuccess,
  fetchCourseDenied,
  fetchCourseFailure,
  fetchCourseSectionVerticalDataSuccess,
  updateLoadingCourseSectionVerticalDataStatus,
  updateLoadingCourseXblockStatus,
  updateCourseVerticalChildren,
  updateCourseVerticalChildrenLoadingStatus,
  updateQueryPendingStatus,
  deleteXBlock,
  duplicateXBlock,
} from './slice';
import { getNotificationMessage } from './utils';

export function fetchCourseUnitQuery(courseId) {
  return async (dispatch) => {
    dispatch(updateLoadingCourseUnitStatus({ status: RequestStatus.IN_PROGRESS }));

    try {
      const courseUnit = await getCourseUnitData(courseId);
      dispatch(fetchCourseItemSuccess(courseUnit));
      dispatch(updateLoadingCourseUnitStatus({ status: RequestStatus.SUCCESSFUL }));
      return true;
    } catch (error) {
      dispatch(updateLoadingCourseUnitStatus({ status: RequestStatus.FAILED }));
      return false;
    }
  };
}

export function fetchCourseSectionVerticalData(courseId, sequenceId) {
  return async (dispatch) => {
    dispatch(updateLoadingCourseSectionVerticalDataStatus({ status: RequestStatus.IN_PROGRESS }));
    dispatch(fetchSequenceRequest({ sequenceId }));

    try {
      const courseSectionVerticalData = await getCourseSectionVerticalData(courseId);
      dispatch(fetchCourseSectionVerticalDataSuccess(courseSectionVerticalData));
      dispatch(updateLoadingCourseSectionVerticalDataStatus({ status: RequestStatus.SUCCESSFUL }));
      dispatch(updateModel({
        modelType: 'sequences',
        model: courseSectionVerticalData.sequence,
      }));
      dispatch(updateModels({
        modelType: 'units',
        models: courseSectionVerticalData.units,
      }));
      dispatch(fetchSequenceSuccess({ sequenceId }));
      return true;
    } catch (error) {
      dispatch(updateLoadingCourseSectionVerticalDataStatus({ status: RequestStatus.FAILED }));
      dispatch(fetchSequenceFailure({ sequenceId }));
      return false;
    }
  };
}

export function editCourseItemQuery(itemId, displayName, sequenceId) {
  return async (dispatch) => {
    dispatch(updateSavingStatus({ status: RequestStatus.PENDING }));
    dispatch(showProcessingNotification(NOTIFICATION_MESSAGES.saving));

    try {
      await editUnitDisplayName(itemId, displayName).then(async (result) => {
        if (result) {
          const courseUnit = await getCourseUnitData(itemId);
          const courseSectionVerticalData = await getCourseSectionVerticalData(itemId);
          dispatch(fetchCourseSectionVerticalDataSuccess(courseSectionVerticalData));
          dispatch(updateLoadingCourseSectionVerticalDataStatus({ status: RequestStatus.SUCCESSFUL }));
          dispatch(updateModel({
            modelType: 'sequences',
            model: courseSectionVerticalData.sequence,
          }));
          dispatch(updateModels({
            modelType: 'units',
            models: courseSectionVerticalData.units,
          }));
          dispatch(fetchSequenceSuccess({ sequenceId }));
          dispatch(fetchCourseItemSuccess(courseUnit));
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

export function editCourseUnitVisibilityAndData(itemId, type, isVisible) {
  return async (dispatch) => {
    dispatch(updateSavingStatus({ status: RequestStatus.PENDING }));
    dispatch(updateQueryPendingStatus(true));
    const notificationMessage = getNotificationMessage(type, isVisible);
    dispatch(showProcessingNotification(notificationMessage));

    try {
      await handleCourseUnitVisibilityAndData(itemId, type, isVisible).then(async (result) => {
        if (result) {
          const courseUnit = await getCourseUnitData(itemId);
          dispatch(fetchCourseItemSuccess(courseUnit));
          const courseVerticalChildrenData = await getCourseVerticalChildren(itemId);
          dispatch(updateCourseVerticalChildren(courseVerticalChildrenData));
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

export function fetchCourse(courseId) {
  return async (dispatch) => {
    dispatch(fetchCourseRequest({ courseId }));
    Promise.allSettled([
      getCourseMetadata(courseId),
      getLearningSequencesOutline(courseId),
      getCourseHomeCourseMetadata(courseId, 'courseware'),
    ]).then(([
      courseMetadataResult,
      learningSequencesOutlineResult,
      courseHomeMetadataResult]) => {
      if (courseMetadataResult.status === 'fulfilled') {
        dispatch(addModel({
          modelType: 'coursewareMeta',
          model: courseMetadataResult.value,
        }));
      }

      if (courseHomeMetadataResult.status === 'fulfilled') {
        dispatch(addModel({
          modelType: 'courseHomeMeta',
          model: {
            id: courseId,
            ...courseHomeMetadataResult.value,
          },
        }));
      }

      if (learningSequencesOutlineResult.status === 'fulfilled') {
        const { courses, sections } = learningSequencesOutlineResult.value;

        // This updates the course with a sectionIds array from the Learning Sequence data.
        dispatch(updateModelsMap({
          modelType: 'coursewareMeta',
          modelsMap: courses,
        }));
        dispatch(addModelsMap({
          modelType: 'sections',
          modelsMap: sections,
        }));
      }

      const fetchedMetadata = courseMetadataResult.status === 'fulfilled';
      const fetchedCourseHomeMetadata = courseHomeMetadataResult.status === 'fulfilled';
      const fetchedOutline = learningSequencesOutlineResult.status === 'fulfilled';

      // Log errors for each request if needed. Outline failures may occur
      // even if the course metadata request is successful
      if (!fetchedOutline) {
        const { response } = learningSequencesOutlineResult.reason;
        if (response && response.status === 403) {
          // 403 responses are normal - they happen when the learner is logged out.
          // We'll redirect them in a moment to the outline tab by calling fetchCourseDenied() below.
          logInfo(learningSequencesOutlineResult.reason);
        } else {
          logError(learningSequencesOutlineResult.reason);
        }
      }
      if (!fetchedMetadata) {
        logError(courseMetadataResult.reason);
      }
      if (!fetchedCourseHomeMetadata) {
        logError(courseHomeMetadataResult.reason);
      }
      if (fetchedMetadata && fetchedCourseHomeMetadata) {
        if (courseHomeMetadataResult.value.courseAccess.hasAccess && fetchedOutline) {
          // User has access
          dispatch(fetchCourseSuccess({ courseId }));
          return;
        }
        // User either doesn't have access or only has partial access
        // (can't access course blocks)
        dispatch(fetchCourseDenied({ courseId }));
        return;
      }

      // Definitely an error happening
      dispatch(fetchCourseFailure({ courseId }));
    });
  };
}

export function createNewCourseXBlock(body, callback, blockId) {
  return async (dispatch) => {
    dispatch(updateLoadingCourseXblockStatus({ status: RequestStatus.IN_PROGRESS }));
    dispatch(showProcessingNotification(NOTIFICATION_MESSAGES.adding));
    dispatch(updateSavingStatus({ status: RequestStatus.PENDING }));

    try {
      await createCourseXblock(body).then(async (result) => {
        if (result) {
          if (body.category === 'vertical') {
            const courseSectionVerticalData = await getCourseSectionVerticalData(result.locator);
            dispatch(fetchCourseSectionVerticalDataSuccess(courseSectionVerticalData));
          }
          const courseVerticalChildrenData = await getCourseVerticalChildren(blockId);
          dispatch(updateCourseVerticalChildren(courseVerticalChildrenData));
          dispatch(hideProcessingNotification());
          dispatch(updateLoadingCourseXblockStatus({ status: RequestStatus.SUCCESSFUL }));
          dispatch(updateSavingStatus({ status: RequestStatus.SUCCESSFUL }));
          if (callback) {
            callback(result);
          }
        }
        const courseUnit = await getCourseUnitData(blockId);
        dispatch(fetchCourseItemSuccess(courseUnit));
      });
    } catch (error) {
      dispatch(hideProcessingNotification());
      dispatch(updateLoadingCourseXblockStatus({ status: RequestStatus.FAILED }));
      dispatch(updateSavingStatus({ status: RequestStatus.FAILED }));
    }
  };
}

export function fetchCourseVerticalChildrenData(itemId) {
  return async (dispatch) => {
    dispatch(updateCourseVerticalChildrenLoadingStatus({ status: RequestStatus.IN_PROGRESS }));

    try {
      const courseVerticalChildrenData = await getCourseVerticalChildren(itemId);
      dispatch(updateCourseVerticalChildren(courseVerticalChildrenData));
      dispatch(updateCourseVerticalChildrenLoadingStatus({ status: RequestStatus.SUCCESSFUL }));
    } catch (error) {
      dispatch(updateCourseVerticalChildrenLoadingStatus({ status: RequestStatus.FAILED }));
    }
  };
}

export function deleteUnitItemQuery(itemId, xblockId) {
  return async (dispatch) => {
    dispatch(updateSavingStatus({ status: RequestStatus.PENDING }));
    dispatch(showProcessingNotification(NOTIFICATION_MESSAGES.deleting));

    try {
      await deleteUnitItem(xblockId);
      dispatch(deleteXBlock(xblockId));
      dispatch(hideProcessingNotification());
      dispatch(updateSavingStatus({ status: RequestStatus.SUCCESSFUL }));
    } catch (error) {
      dispatch(hideProcessingNotification());
      dispatch(updateSavingStatus({ status: RequestStatus.FAILED }));
    }
  };
}

export function duplicateUnitItemQuery(itemId, xblockId) {
  return async (dispatch) => {
    dispatch(updateSavingStatus({ status: RequestStatus.PENDING }));
    dispatch(showProcessingNotification(NOTIFICATION_MESSAGES.duplicating));

    try {
      const { locator } = await duplicateUnitItem(itemId, xblockId);
      const newCourseVerticalChildren = await getCourseVerticalChildren(itemId);
      dispatch(duplicateXBlock({
        newId: locator,
        newCourseVerticalChildren,
      }));
      dispatch(hideProcessingNotification());
      dispatch(updateSavingStatus({ status: RequestStatus.SUCCESSFUL }));
    } catch (error) {
      dispatch(hideProcessingNotification());
      dispatch(updateSavingStatus({ status: RequestStatus.FAILED }));
    }
  };
}
