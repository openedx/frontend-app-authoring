import { logError } from '@edx/frontend-platform/logging';
import { camelCaseObject } from '@edx/frontend-platform';

import {
  hideProcessingNotification,
  showProcessingNotification,
} from '../../generic/processing-notification/data/slice';
import { RequestStatus } from '../../data/constants';
import { NOTIFICATION_MESSAGES } from '../../constants';
import { updateModel, updateModels } from '../../generic/model-store';
import {
  getCourseUnitData,
  editUnitDisplayName,
  getCourseSectionVerticalData,
  createCourseXblock,
  getCourseVerticalChildren,
  updateClipboard,
  getClipboard,
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
  fetchCourseSectionVerticalDataSuccess,
  updateLoadingCourseSectionVerticalDataStatus,
  updateLoadingCourseXblockStatus,
  updateCourseVerticalChildren,
  updateCourseVerticalChildrenLoadingStatus,
  updateClipboardData,
  updateQueryPendingStatus,
  deleteXBlock,
  duplicateXBlock,
} from './slice';
import { CLIPBOARD_STATUS } from '../constants';
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
      dispatch(updateClipboardData(courseSectionVerticalData.userClipboard));
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

export function createNewCourseXBlock(body, callback, blockId) {
  return async (dispatch) => {
    dispatch(updateLoadingCourseXblockStatus({ status: RequestStatus.IN_PROGRESS }));
    dispatch(showProcessingNotification(NOTIFICATION_MESSAGES.adding));
    dispatch(updateSavingStatus({ status: RequestStatus.PENDING }));

    try {
      await createCourseXblock(body).then(async (result) => {
        if (result) {
          const formattedResult = camelCaseObject(result);
          if (body.category === 'vertical') {
            const courseSectionVerticalData = await getCourseSectionVerticalData(formattedResult.locator);
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
          const currentBlockId = body.category === 'vertical' ? formattedResult.locator : blockId;
          const courseUnit = await getCourseUnitData(currentBlockId);
          dispatch(fetchCourseItemSuccess(courseUnit));
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
      const courseUnit = await getCourseUnitData(itemId);
      dispatch(fetchCourseItemSuccess(courseUnit));
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
      const courseUnit = await getCourseUnitData(itemId);
      dispatch(fetchCourseItemSuccess(courseUnit));
      dispatch(hideProcessingNotification());
      dispatch(updateSavingStatus({ status: RequestStatus.SUCCESSFUL }));
    } catch (error) {
      dispatch(hideProcessingNotification());
      dispatch(updateSavingStatus({ status: RequestStatus.FAILED }));
    }
  };
}

export function copyToClipboard(usageKey) {
  const POLL_INTERVAL_MS = 1000; // Timeout duration for polling in milliseconds

  return async (dispatch) => {
    dispatch(updateClipboardData(null));
    dispatch(showProcessingNotification(NOTIFICATION_MESSAGES.copying));
    dispatch(updateSavingStatus({ status: RequestStatus.PENDING }));
    dispatch(updateQueryPendingStatus(true));

    try {
      let clipboardData = await updateClipboard(usageKey);

      while (clipboardData.content?.status === CLIPBOARD_STATUS.loading) {
        // eslint-disable-next-line no-await-in-loop,no-promise-executor-return
        await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
        clipboardData = await getClipboard(); // eslint-disable-line no-await-in-loop
      }

      if (clipboardData.content?.status === CLIPBOARD_STATUS.ready) {
        dispatch(updateClipboardData(clipboardData));
        dispatch(updateSavingStatus({ status: RequestStatus.SUCCESSFUL }));
      } else {
        throw new Error(`Unexpected clipboard status "${clipboardData.content?.status}" in successful API response.`);
      }
    } catch (error) {
      dispatch(updateSavingStatus({ status: RequestStatus.FAILED }));
      logError('Error copying to clipboard:', error);
    } finally {
      dispatch(hideProcessingNotification());
    }
  };
}
