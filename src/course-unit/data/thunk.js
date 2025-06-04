import { camelCaseObject } from '@edx/frontend-platform';

import {
  hideProcessingNotification,
  showProcessingNotification,
} from '../../generic/processing-notification/data/slice';
import { handleResponseErrors } from '../../generic/saving-error-alert';
import { RequestStatus } from '../../data/constants';
import { NOTIFICATION_MESSAGES } from '../../constants';
import { updateModel, updateModels } from '../../generic/model-store';
import { messageTypes } from '../constants';
import {
  editUnitDisplayName,
  getVerticalData,
  createCourseXblock,
  getCourseVerticalChildren,
  handleCourseUnitVisibilityAndData,
  deleteUnitItem,
  duplicateUnitItem,
  getCourseOutlineInfo,
  patchUnitItem,
} from './api';
import {
  updateSavingStatus,
  fetchSequenceRequest,
  fetchSequenceFailure,
  fetchSequenceSuccess,
  fetchCourseSectionVerticalDataSuccess,
  updateLoadingCourseSectionVerticalDataStatus,
  updateCourseVerticalChildren,
  updateCourseVerticalChildrenLoadingStatus,
  updateQueryPendingStatus,
  fetchStaticFileNoticesSuccess,
  updateCourseOutlineInfo,
  updateCourseOutlineInfoLoadingStatus,
  updateMovedXBlockParams,
} from './slice';
import { getNotificationMessage } from './utils';

export function fetchCourseSectionVerticalData(courseId, sequenceId) {
  return async (dispatch) => {
    dispatch(updateLoadingCourseSectionVerticalDataStatus({ status: RequestStatus.IN_PROGRESS }));
    dispatch(fetchSequenceRequest({ sequenceId }));

    try {
      const courseSectionVerticalData = await getVerticalData(courseId);
      dispatch(fetchCourseSectionVerticalDataSuccess(courseSectionVerticalData));
      dispatch(updateLoadingCourseSectionVerticalDataStatus({ status: RequestStatus.SUCCESSFUL }));
      dispatch(updateModel({
        modelType: 'sequences',
        model: courseSectionVerticalData.sequence || [],
      }));
      dispatch(updateModels({
        modelType: 'units',
        models: courseSectionVerticalData.units || [],
      }));
      dispatch(fetchStaticFileNoticesSuccess(JSON.parse(localStorage.getItem('staticFileNotices'))));
      localStorage.removeItem('staticFileNotices');
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
          const courseSectionVerticalData = await getVerticalData(itemId);
          dispatch(fetchCourseSectionVerticalDataSuccess(courseSectionVerticalData));
          dispatch(updateLoadingCourseSectionVerticalDataStatus({ status: RequestStatus.SUCCESSFUL }));
          dispatch(updateModel({
            modelType: 'sequences',
            model: courseSectionVerticalData.sequence || [],
          }));
          dispatch(updateModels({
            modelType: 'units',
            models: courseSectionVerticalData.units || [],
          }));
          dispatch(fetchSequenceSuccess({ sequenceId }));
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
  callback,
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
          if (callback) {
            callback();
          }
          const courseSectionVerticalData = await getVerticalData(blockId);
          dispatch(fetchCourseSectionVerticalDataSuccess(courseSectionVerticalData));
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

export function createNewCourseXBlock(body, callback, blockId, sendMessageToIframe) {
  return async (dispatch) => {
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
            const courseSectionVerticalData = await getVerticalData(formattedResult.locator);
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
          if (callback) {
            callback(result);
          } else {
            sendMessageToIframe(messageTypes.addXBlock, { data: result });
          }
          const currentBlockId = body.category === 'vertical' ? formattedResult.locator : blockId;
          const courseSectionVerticalData = await getVerticalData(currentBlockId);
          dispatch(fetchCourseSectionVerticalDataSuccess(courseSectionVerticalData));
        }
      });
    } catch (error) {
      dispatch(hideProcessingNotification());
      handleResponseErrors(error, dispatch, updateSavingStatus);
    }
  };
}

export function fetchCourseVerticalChildrenData(itemId, isSplitTestType, skipPageLoading) {
  return async (dispatch) => {
    if (!skipPageLoading) {
      dispatch(updateCourseVerticalChildrenLoadingStatus({ status: RequestStatus.IN_PROGRESS }));
    }

    try {
      const courseVerticalChildrenData = await getCourseVerticalChildren(itemId);
      if (isSplitTestType) {
        const blockIds = courseVerticalChildrenData.children.map(child => child.blockId);
        const childrenDataArray = await Promise.all(
          blockIds.map(blockId => getCourseVerticalChildren(blockId)),
        );
        const allChildren = childrenDataArray.reduce(
          (acc, data) => acc.concat(data.children || []),
          [],
        );
        courseVerticalChildrenData.children = [...courseVerticalChildrenData.children, ...allChildren];
      }
      dispatch(updateCourseVerticalChildren(courseVerticalChildrenData));
      dispatch(updateCourseVerticalChildrenLoadingStatus({ status: RequestStatus.SUCCESSFUL }));
    } catch (error) {
      dispatch(updateCourseVerticalChildrenLoadingStatus({ status: RequestStatus.FAILED }));
    }
  };
}

export function deleteUnitItemQuery(itemId, xblockId, sendMessageToIframe) {
  return async (dispatch) => {
    dispatch(updateSavingStatus({ status: RequestStatus.PENDING }));
    dispatch(showProcessingNotification(NOTIFICATION_MESSAGES.deleting));

    try {
      await deleteUnitItem(xblockId);
      sendMessageToIframe(messageTypes.completeXBlockDeleting, { locator: xblockId });
      const courseSectionVerticalData = await getVerticalData(itemId);
      dispatch(fetchCourseSectionVerticalDataSuccess(courseSectionVerticalData));
      dispatch(hideProcessingNotification());
      dispatch(updateSavingStatus({ status: RequestStatus.SUCCESSFUL }));
    } catch (error) {
      dispatch(hideProcessingNotification());
      handleResponseErrors(error, dispatch, updateSavingStatus);
    }
  };
}

export function duplicateUnitItemQuery(itemId, xblockId, callback) {
  return async (dispatch) => {
    dispatch(updateSavingStatus({ status: RequestStatus.PENDING }));
    dispatch(showProcessingNotification(NOTIFICATION_MESSAGES.duplicating));

    try {
      const { courseKey, locator } = await duplicateUnitItem(itemId, xblockId);
      callback(courseKey, locator);
      const courseSectionVerticalData = await getVerticalData(itemId);
      dispatch(fetchCourseSectionVerticalDataSuccess(courseSectionVerticalData));
      const courseVerticalChildrenData = await getCourseVerticalChildren(itemId);
      dispatch(updateCourseVerticalChildren(courseVerticalChildrenData));
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
      callbackFn(sourceLocator);
      try {
        const courseSectionVerticalData = await getVerticalData(currentParentLocator);
        dispatch(fetchCourseSectionVerticalDataSuccess(courseSectionVerticalData));
      } catch (error) {
        handleResponseErrors(error, dispatch, updateSavingStatus);
      }
    } catch (error) {
      handleResponseErrors(error, dispatch, updateSavingStatus);
    } finally {
      dispatch(hideProcessingNotification());
    }
  };
}

export function updateCourseUnitSidebar(itemId) {
  return async (dispatch) => {
    dispatch(updateSavingStatus({ status: RequestStatus.PENDING }));
    dispatch(showProcessingNotification(NOTIFICATION_MESSAGES.saving));

    try {
      const courseSectionVerticalData = await getVerticalData(itemId);
      dispatch(fetchCourseSectionVerticalDataSuccess(courseSectionVerticalData));
      dispatch(hideProcessingNotification());
      dispatch(updateSavingStatus({ status: RequestStatus.SUCCESSFUL }));
    } catch (error) {
      dispatch(hideProcessingNotification());
      handleResponseErrors(error, dispatch, updateSavingStatus);
    }
  };
}
