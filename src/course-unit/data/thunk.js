import { camelCaseObject } from '@edx/frontend-platform';

import {
  hideProcessingNotification,
  showProcessingNotification,
} from '../../generic/processing-notification/data/slice';
import { handleResponseErrors } from '../../generic/saving-error-alert';
import { RequestStatus } from '../../data/constants';
import { NOTIFICATION_MESSAGES } from '../../constants';
import { updateModel, updateModels } from '../../generic/model-store';
import { updateClipboardData } from '../../generic/data/slice';
import {
  getCourseUnitData,
  editUnitDisplayName,
  getCourseSectionVerticalData,
  createCourseXblock,
  getCourseVerticalChildren,
  handleCourseUnitVisibilityAndData,
  deleteUnitItem,
  duplicateUnitItem,
  getCourseOutlineInfo,
  patchUnitItem,
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
  updateQueryPendingStatus,
  deleteXBlock,
  duplicateXBlock,
  fetchStaticFileNoticesSuccess,
  updateCourseOutlineInfo,
  updateCourseOutlineInfoLoadingStatus,
  updateMovedXBlockParams,
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
      dispatch(fetchStaticFileNoticesSuccess(JSON.parse(localStorage.getItem('staticFileNotices'))));
      localStorage.removeItem('staticFileNotices');
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
      handleResponseErrors(error, dispatch, updateSavingStatus);
    }
  };
}

export function editCourseUnitVisibilityAndData(
  itemId,
  type,
  isVisible,
  groupAccess,
  isDiscussionEnabled,
  blockId = itemId,
) {
  return async (dispatch) => {
    dispatch(updateSavingStatus({ status: RequestStatus.PENDING }));
    dispatch(updateQueryPendingStatus(true));
    const notification = getNotificationMessage(type, isVisible, true);
    dispatch(showProcessingNotification(notification));

    try {
      await handleCourseUnitVisibilityAndData(
        itemId,
        type,
        isVisible,
        groupAccess,
        isDiscussionEnabled,
      ).then(async (result) => {
        if (result) {
          const courseUnit = await getCourseUnitData(blockId);
          dispatch(fetchCourseItemSuccess(courseUnit));
          const courseVerticalChildrenData = await getCourseVerticalChildren(blockId);
          dispatch(updateCourseVerticalChildren(courseVerticalChildrenData));
          dispatch(hideProcessingNotification());
          dispatch(updateSavingStatus({ status: RequestStatus.SUCCESSFUL }));
        }
      });
    } catch (error) {
      dispatch(hideProcessingNotification());
      handleResponseErrors(error, dispatch, updateSavingStatus);
    }
  };
}

export function createNewCourseXBlock(body, callback, blockId) {
  return async (dispatch) => {
    dispatch(updateLoadingCourseXblockStatus({ status: RequestStatus.IN_PROGRESS }));
    dispatch(updateSavingStatus({ status: RequestStatus.PENDING }));

    if (body.stagedContent) {
      dispatch(showProcessingNotification(NOTIFICATION_MESSAGES.pasting));
    } else {
      dispatch(showProcessingNotification(NOTIFICATION_MESSAGES.adding));
    }

    try {
      await createCourseXblock(body).then(async (result) => {
        if (result) {
          const formattedResult = camelCaseObject(result);
          if (body.category === 'vertical') {
            const courseSectionVerticalData = await getCourseSectionVerticalData(formattedResult.locator);
            dispatch(fetchCourseSectionVerticalDataSuccess(courseSectionVerticalData));
          }
          if (body.stagedContent) {
            localStorage.setItem('staticFileNotices', JSON.stringify(formattedResult.staticFileNotices));
            dispatch(fetchStaticFileNoticesSuccess(formattedResult.staticFileNotices));

            if (body.parentLocator.includes('vertical')) {
              localStorage.removeItem('staticFileNotices');
            }
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
      });
    } catch (error) {
      dispatch(hideProcessingNotification());
      dispatch(updateLoadingCourseXblockStatus({ status: RequestStatus.FAILED }));
      handleResponseErrors(error, dispatch, updateSavingStatus);
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
      const { userClipboard } = await getCourseSectionVerticalData(itemId);
      dispatch(updateClipboardData(userClipboard));
      const courseUnit = await getCourseUnitData(itemId);
      dispatch(fetchCourseItemSuccess(courseUnit));
      dispatch(hideProcessingNotification());
      dispatch(updateSavingStatus({ status: RequestStatus.SUCCESSFUL }));
    } catch (error) {
      dispatch(hideProcessingNotification());
      handleResponseErrors(error, dispatch, updateSavingStatus);
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
      handleResponseErrors(error, dispatch, updateSavingStatus);
    }
  };
}

export function getCourseOutlineInfoQuery(courseId) {
  return async (dispatch) => {
    dispatch(updateCourseOutlineInfoLoadingStatus({ status: RequestStatus.IN_PROGRESS }));

    try {
      const result = await getCourseOutlineInfo(courseId);
      if (result) {
        dispatch(updateCourseOutlineInfo(result));
        dispatch(updateCourseOutlineInfoLoadingStatus({ status: RequestStatus.SUCCESSFUL }));
      }
    } catch (error) {
      handleResponseErrors(error, dispatch, updateSavingStatus);
      dispatch(updateCourseOutlineInfoLoadingStatus({ status: RequestStatus.FAILED }));
    }
  };
}

export function patchUnitItemQuery({
  sourceLocator = '',
  targetParentLocator = '',
  title,
  currentParentLocator = '',
  isMoving,
  callbackFn,
}) {
  return async (dispatch) => {
    dispatch(updateSavingStatus({ status: RequestStatus.PENDING }));
    dispatch(showProcessingNotification(NOTIFICATION_MESSAGES[isMoving ? 'moving' : 'undoMoving']));

    try {
      await patchUnitItem(sourceLocator, isMoving ? targetParentLocator : currentParentLocator);
      const xBlockParams = {
        title,
        isSuccess: true,
        isUndo: !isMoving,
        sourceLocator,
        targetParentLocator,
        currentParentLocator,
      };
      dispatch(updateMovedXBlockParams(xBlockParams));
      dispatch(updateCourseOutlineInfo({}));
      dispatch(updateCourseOutlineInfoLoadingStatus({ status: RequestStatus.IN_PROGRESS }));
      const courseUnit = await getCourseUnitData(currentParentLocator);
      dispatch(fetchCourseItemSuccess(courseUnit));
      callbackFn();
    } catch (error) {
      handleResponseErrors(error, dispatch, updateSavingStatus);
    } finally {
      dispatch(hideProcessingNotification());
    }
  };
}
