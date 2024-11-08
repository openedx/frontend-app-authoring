import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToggle } from '@openedx/paragon';
import { camelCaseObject } from '@edx/frontend-platform/utils';

import { RequestStatus } from '../data/constants';
import { useCopyToClipboard } from '../generic/clipboard';
import { useEventListener } from '../generic/hooks';
import {
  createNewCourseXBlock,
  fetchCourseUnitQuery,
  editCourseItemQuery,
  fetchCourseSectionVerticalData,
  fetchCourseVerticalChildrenData,
  deleteUnitItemQuery,
  editCourseUnitVisibilityAndData,
  getCourseOutlineInfoQuery,
  patchUnitItemQuery,
} from './data/thunk';
import {
  getCourseSectionVertical,
  getCourseVerticalChildren,
  getCourseUnitData,
  getIsLoading,
  getSavingStatus,
  getErrorMessage,
  getSequenceStatus,
  getStaticFileNotices,
  getCanEdit,
  getCourseOutlineInfo,
  getMovedXBlockParams,
} from './data/selectors';
import {
  changeEditTitleFormOpen,
  updateQueryPendingStatus,
  updateMovedXBlockParams,
} from './data/slice';
import { useIframe } from './context/hooks';
import { messageTypes, PUBLISH_TYPES } from './constants';

// eslint-disable-next-line import/prefer-default-export
export const useCourseUnit = ({ courseId, blockId }) => {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const { sendMessageToIframe } = useIframe();
  const [addComponentTemplateData, setAddComponentTemplateData] = useState({});
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
      blockId,
    ));
    closeModalFn();
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

  const handleCreateNewCourseXBlock = (body, callback, preventDisplayLoading) => (
    dispatch(createNewCourseXBlock(body, callback, blockId, preventDisplayLoading))
  );

  const unitXBlockActions = {
    // TODO: use for xblock delete functionality
    handleDelete: (XBlockId) => {
      dispatch(deleteUnitItemQuery(blockId, XBlockId));
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
        sendMessageToIframe(messageTypes.refreshXBlock, null);
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

  const handleSubmitAddComponentModal = () => {
    // TODO: this artificial delay is a temporary solution
    // to ensure the iframe content is properly refreshed.
    setTimeout(() => {
      setAddComponentTemplateData({});
      sendMessageToIframe(messageTypes.refreshXBlock, null);
    }, 1000);
  };

  const receiveMessage = useCallback(({ data }) => {
    const { payload, type } = data;

    if (type === messageTypes.handleViewXBlockContent) {
      const newUnitId = payload.destination.split('/').pop();
      navigate(`/course/${courseId}/container/${newUnitId}/${sequenceId}`);
    }

    if (type === messageTypes.showComponentTemplates) {
      setAddComponentTemplateData(camelCaseObject(payload));
    }
  }, []);

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
    sharedClipboardData,
    showPasteXBlock,
    showPasteUnit,
    unitXBlockActions,
    headerNavigationsActions,
    handleTitleEdit,
    handleTitleEditSubmit,
    handleCreateNewCourseXBlock,
    handleConfigureSubmit,
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
    handleSubmitAddComponentModal,
  };
};
