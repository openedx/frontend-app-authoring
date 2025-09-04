import {
  useCallback, useEffect, useMemo, useRef, useState,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToggle } from '@openedx/paragon';
import { camelCaseObject } from '@edx/frontend-platform/utils';

import { RequestStatus } from '../data/constants';
import { useClipboard } from '../generic/clipboard';
import { useEventListener } from '../generic/hooks';
import { COURSE_BLOCK_NAMES, iframeMessageTypes } from '../constants';
import { messageTypes, PUBLISH_TYPES } from './constants';
import {
  createNewCourseXBlock,
  deleteUnitItemQuery,
  duplicateUnitItemQuery,
  editCourseItemQuery,
  editCourseUnitVisibilityAndData,
  fetchCourseSectionVerticalData,
  fetchCourseVerticalChildrenData,
  getCourseOutlineInfoQuery,
  patchUnitItemQuery,
} from './data/thunk';
import {
  getCanEdit,
  getCourseOutlineInfo,
  getCourseSectionVertical,
  getCourseUnitData,
  getCourseVerticalChildren,
  getErrorMessage,
  getIsLoading,
  getMovedXBlockParams,
  getSavingStatus,
  getSequenceStatus,
  getStaticFileNotices,
  getLoadingStatuses,
} from './data/selectors';
import {
  changeEditTitleFormOpen,
  updateMovedXBlockParams,
  updateQueryPendingStatus,
} from './data/slice';
import { useIframe } from '../generic/hooks/context/hooks';

export const useCourseUnit = ({ courseId, blockId }) => {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const { sendMessageToIframe } = useIframe();
  const [addComponentTemplateData, setAddComponentTemplateData] = useState({});
  const [isMoveModalOpen, openMoveModal, closeMoveModal] = useToggle(false);

  const courseUnit = useSelector(getCourseUnitData);
  const courseUnitLoadingStatus = useSelector(getLoadingStatuses);
  const savingStatus = useSelector(getSavingStatus);
  const isLoading = useSelector(getIsLoading);
  const errorMessage = useSelector(getErrorMessage);
  const sequenceStatus = useSelector(getSequenceStatus);
  const { draftPreviewLink, publishedPreviewLink, xblockInfo = {} } = useSelector(getCourseSectionVertical);
  const courseVerticalChildren = useSelector(getCourseVerticalChildren);
  const staticFileNotices = useSelector(getStaticFileNotices);
  const navigate = useNavigate();
  const isTitleEditFormOpen = useSelector(state => state.courseUnit.isTitleEditFormOpen);
  const canEdit = useSelector(getCanEdit);
  const courseOutlineInfo = useSelector(getCourseOutlineInfo);
  const movedXBlockParams = useSelector(getMovedXBlockParams);
  const { currentlyVisibleToStudents } = courseUnit;
  const { sharedClipboardData, showPasteXBlock, showPasteUnit } = useClipboard(canEdit);
  const { canPasteComponent } = courseVerticalChildren;
  const { displayName: unitTitle, category: unitCategory } = xblockInfo;
  const sequenceId = courseUnit.ancestorInfo?.ancestors[0].id;
  const isUnitVerticalType = unitCategory === COURSE_BLOCK_NAMES.vertical.id;
  const isUnitLibraryType = unitCategory === COURSE_BLOCK_NAMES.libraryContent.id;
  const isSplitTestType = unitCategory === COURSE_BLOCK_NAMES.splitTest.id;

  const headerNavigationsActions = {
    handleViewLive: () => {
      window.open(publishedPreviewLink, '_blank');
    },
    handlePreview: () => {
      window.open(draftPreviewLink, '_blank');
    },
    handleEdit: () => {
      sendMessageToIframe(messageTypes.editXBlock, { id: courseUnit.id }, window);
    },
  };

  const handleTitleEdit = () => {
    dispatch(changeEditTitleFormOpen(!isTitleEditFormOpen));
  };

  const handleConfigureSubmit = (id, isVisible, groupAccess, isDiscussionEnabled, closeModalFn) => {
    dispatch(editCourseUnitVisibilityAndData(
      id,
      PUBLISH_TYPES.republish,
      isVisible,
      groupAccess,
      isDiscussionEnabled,
      () => sendMessageToIframe(messageTypes.completeManageXBlockAccess, { locator: id }),
      blockId,
    ));
    if (typeof closeModalFn === 'function') {
      closeModalFn();
    }
  };

  const handleTitleEditSubmit = (displayName) => {
    if (unitTitle !== displayName) {
      dispatch(editCourseItemQuery(blockId, displayName, sequenceId));
    }

    handleTitleEdit();
  };

  const handleNavigate = (id) => {
    if (sequenceId) {
      const path = `/course/${courseId}/container/${blockId}/${id}`;
      const options = { replace: true };
      if (searchParams.size) {
        navigate({
          pathname: path,
          search: `?${searchParams}`,
        }, options);
      } else {
        navigate(path, options);
      }
    }
  };

  const handleCreateNewCourseXBlock = (body, callback) => (
    dispatch(createNewCourseXBlock(body, callback, blockId, sendMessageToIframe))
  );

  const unitXBlockActions = {
    handleDelete: (XBlockId) => {
      dispatch(deleteUnitItemQuery(blockId, XBlockId, sendMessageToIframe));
    },
    handleDuplicate: (XBlockId) => {
      dispatch(duplicateUnitItemQuery(
        blockId,
        XBlockId,
        (courseKey, locator) => sendMessageToIframe(messageTypes.completeXBlockDuplicating, { courseKey, locator }),
      ));
    },
  };

  const handleRollbackMovedXBlock = () => {
    const {
      sourceLocator, targetParentLocator, title, currentParentLocator,
    } = movedXBlockParams;
    dispatch(patchUnitItemQuery({
      sourceLocator,
      targetParentLocator,
      title,
      currentParentLocator,
      isMoving: false,
      callbackFn: () => {
        sendMessageToIframe(messageTypes.rollbackMovedXBlock, { locator: sourceLocator });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
    }));
  };

  const handleCloseXBlockMovedAlert = () => {
    dispatch(updateMovedXBlockParams({ isSuccess: false }));
  };

  const handleNavigateToTargetUnit = () => {
    navigate(`/course/${courseId}/container/${movedXBlockParams.targetParentLocator}`);
  };

  const receiveMessage = useCallback(({ data }) => {
    const { payload, type } = data;

    if (type === messageTypes.handleViewXBlockContent) {
      const { usageId } = payload;
      navigate(`/course/${courseId}/container/${usageId}/${sequenceId}`);
    }

    if (type === messageTypes.handleViewGroupConfigurations) {
      const { usageId } = payload;
      const groupId = usageId.split('#').pop();
      navigate(`/course/${courseId}/group_configurations#${groupId}`);
    }

    if (type === messageTypes.showComponentTemplates) {
      setAddComponentTemplateData(camelCaseObject(payload));
    }
  }, [courseId, sequenceId]);

  useEventListener('message', receiveMessage);

  useEffect(() => {
    if (savingStatus === RequestStatus.SUCCESSFUL) {
      dispatch(updateQueryPendingStatus(true));
    }
  }, [savingStatus]);

  useEffect(() => {
    dispatch(fetchCourseSectionVerticalData(blockId, sequenceId));
    dispatch(fetchCourseVerticalChildrenData(blockId, isSplitTestType));
    handleNavigate(sequenceId);
    dispatch(updateMovedXBlockParams({ isSuccess: false }));
  }, [courseId, blockId, sequenceId]);

  useEffect(() => {
    if (isSplitTestType) {
      dispatch(fetchCourseVerticalChildrenData(blockId, isSplitTestType));
    }
  }, [isSplitTestType, blockId]);

  useEffect(() => {
    if (isMoveModalOpen && !Object.keys(courseOutlineInfo).length) {
      dispatch(getCourseOutlineInfoQuery(courseId));
    }
  }, [isMoveModalOpen]);

  useEffect(() => {
    const handlePageRefreshUsingStorage = (event) => {
      // ignoring tests for if block, because it triggers when someone
      // edits the component using editor which has a separate store
      /* istanbul ignore next */
      if (event.key === 'courseRefreshTriggerOnComponentEditSave') {
        dispatch(fetchCourseSectionVerticalData(blockId, sequenceId));
        dispatch(fetchCourseVerticalChildrenData(blockId, isSplitTestType));
        localStorage.removeItem(event.key);
      }
    };

    window.addEventListener('storage', handlePageRefreshUsingStorage);
    return () => {
      window.removeEventListener('storage', handlePageRefreshUsingStorage);
    };
  }, [blockId, sequenceId, isSplitTestType]);

  return {
    sequenceId,
    courseUnit,
    courseUnitLoadingStatus,
    unitTitle,
    unitCategory,
    errorMessage,
    sequenceStatus,
    savingStatus,
    staticFileNotices,
    currentlyVisibleToStudents,
    isLoading,
    isTitleEditFormOpen,
    isUnitVerticalType,
    isUnitLibraryType,
    isSplitTestType,
    sharedClipboardData,
    showPasteXBlock,
    showPasteUnit,
    unitXBlockActions,
    headerNavigationsActions,
    handleTitleEdit,
    handleTitleEditSubmit,
    handleCreateNewCourseXBlock,
    handleConfigureSubmit,
    courseVerticalChildren,
    canPasteComponent,
    isMoveModalOpen,
    openMoveModal,
    closeMoveModal,
    handleRollbackMovedXBlock,
    handleCloseXBlockMovedAlert,
    movedXBlockParams,
    handleNavigateToTargetUnit,
    addComponentTemplateData,
    setAddComponentTemplateData,
  };
};

/**
 * Custom hook to determine the layout grid configuration based on unit category and type.
 *
 * @param {string} unitCategory - The category of the unit. This may influence future layout logic.
 * @param {boolean} isUnitLibraryType - A flag indicating whether the unit is of library content type.
 * @returns {Object} - An object representing the layout configuration for different screen sizes.
 *                     The configuration includes keys like 'lg', 'md', 'sm', 'xs', and 'xl',
 *                     each specifying an array of layout spans.
 */
export const useLayoutGrid = (unitCategory, isUnitLibraryType) => (
  useMemo(() => {
    const layouts = {
      fullWidth: {
        lg: [{ span: 12 }, { span: 0 }],
        md: [{ span: 12 }, { span: 0 }],
        sm: [{ span: 12 }, { span: 0 }],
        xs: [{ span: 12 }, { span: 0 }],
        xl: [{ span: 12 }, { span: 0 }],
      },
      default: {
        lg: [{ span: 8 }, { span: 4 }],
        md: [{ span: 8 }, { span: 4 }],
        sm: [{ span: 8 }, { span: 3 }],
        xs: [{ span: 9 }, { span: 3 }],
        xl: [{ span: 9 }, { span: 3 }],
      },
    };

    return isUnitLibraryType ? layouts.fullWidth : layouts.default;
  }, [unitCategory])
);

/**
 * Custom hook that restores the scroll position from `localStorage` after a page reload.
 * It listens for a `plugin.resize` message event and scrolls the window to the saved position
 * after a 1-second delay, provided no new resize messages are received during that time.
 *
 * @param {string} [storageKey='createXBlockLastYPosition'] -
 * The key used to store the last scroll position in `localStorage`.
 */
export const useScrollToLastPosition = (storageKey = 'createXBlockLastYPosition') => {
  const timeoutRef = useRef(null);
  const [hasLastPosition, setHasLastPosition] = useState(() => !!localStorage.getItem(storageKey));

  const scrollToLastPosition = useCallback(() => {
    const lastYPosition = localStorage.getItem(storageKey);
    if (!lastYPosition) {
      setHasLastPosition(false);
      return;
    }

    const yPosition = parseInt(lastYPosition, 10);
    if (!Number.isNaN(yPosition)) {
      window.scrollTo({ top: yPosition, behavior: 'smooth' });
      localStorage.removeItem(storageKey);
      setHasLastPosition(false);
    }
  }, [storageKey]);

  const handleMessage = useCallback((event) => {
    if (event.data?.type === iframeMessageTypes.resize) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(scrollToLastPosition, 1000);
    }
  }, [scrollToLastPosition]);

  useEffect(() => {
    if (!hasLastPosition) {
      return undefined;
    }

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [hasLastPosition, handleMessage]);

  return null;
};
