import { useCallback, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToggle } from '@openedx/paragon';

import { RequestStatus } from '../data/constants';
import { useCopyToClipboard } from '../generic/clipboard';
import { useEventListener } from '../generic/hooks';
import { COURSE_BLOCK_NAMES } from '../constants';
import { messageTypes, PUBLISH_TYPES } from './constants';
import {
  createNewCourseXBlock,
  deleteUnitItemQuery,
  duplicateUnitItemQuery,
  editCourseItemQuery,
  editCourseUnitVisibilityAndData,
  fetchCourseSectionVerticalData,
  fetchCourseUnitQuery,
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
} from './data/selectors';
import {
  changeEditTitleFormOpen,
  updateMovedXBlockParams,
  updateQueryPendingStatus,
} from './data/slice';
import { useIframe } from './context/hooks';

export const useCourseUnit = ({ courseId, blockId }) => {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const { sendMessageToIframe } = useIframe();
  const [isMoveModalOpen, openMoveModal, closeMoveModal] = useToggle(false);

  const courseUnit = useSelector(getCourseUnitData);
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
  const { sharedClipboardData, showPasteXBlock, showPasteUnit } = useCopyToClipboard(canEdit);
  const { canPasteComponent } = courseVerticalChildren;
  const { displayName: unitTitle, category: unitCategory } = xblockInfo;
  const sequenceId = courseUnit.ancestorInfo?.ancestors[0].id;
  const isUnitVerticalType = unitCategory === COURSE_BLOCK_NAMES.vertical.id;
  const isUnitLibraryType = unitCategory === COURSE_BLOCK_NAMES.libraryContent.id;

  const headerNavigationsActions = {
    handleViewLive: () => {
      window.open(publishedPreviewLink, '_blank');
    },
    handlePreview: () => {
      window.open(draftPreviewLink, '_blank');
    },
    handleEdit: () => {},
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
  }, [courseId, sequenceId]);

  useEventListener('message', receiveMessage);

  useEffect(() => {
    if (savingStatus === RequestStatus.SUCCESSFUL) {
      dispatch(updateQueryPendingStatus(true));
    }
  }, [savingStatus]);

  useEffect(() => {
    dispatch(fetchCourseUnitQuery(blockId));
    dispatch(fetchCourseSectionVerticalData(blockId, sequenceId));
    dispatch(fetchCourseVerticalChildrenData(blockId));

    handleNavigate(sequenceId);
    dispatch(updateMovedXBlockParams({ isSuccess: false }));
  }, [courseId, blockId, sequenceId]);

  useEffect(() => {
    if (isMoveModalOpen && !Object.keys(courseOutlineInfo).length) {
      dispatch(getCourseOutlineInfoQuery(courseId));
    }
  }, [isMoveModalOpen]);

  return {
    sequenceId,
    courseUnit,
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
