import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { RequestStatus } from '../data/constants';
import {
  createNewCourseXBlock,
  fetchCourseUnitQuery,
  editCourseItemQuery,
  fetchCourseSectionVerticalData,
  fetchCourseVerticalChildrenData,
  deleteUnitItemQuery,
  duplicateUnitItemQuery,
  setXBlockOrderListQuery,
  editCourseUnitVisibilityAndData,
  rollbackUnitItemQuery,
} from './data/thunk';
import {
  getCourseSectionVertical,
  getCourseVerticalChildren,
  getCourseUnitData,
  getIsLoading,
  getSavingStatus,
  getSequenceStatus,
  getStaticFileNotices,
  getCanEdit,
  getMovedXBlockParams,
} from './data/selectors';
import {
  changeEditTitleFormOpen,
  updateQueryPendingStatus,
  updateMovedXBlockParams,
} from './data/slice';
import { PUBLISH_TYPES } from './constants';

import { useCopyToClipboard } from '../generic/clipboard';
import { createCorrectInternalRoute } from '../utils';

// eslint-disable-next-line import/prefer-default-export
export const useCourseUnit = ({ courseId, blockId }) => {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();

  const [isErrorAlert, toggleErrorAlert] = useState(false);
  const [hasInternetConnectionError, setInternetConnectionError] = useState(false);
  const courseUnit = useSelector(getCourseUnitData);
  const savingStatus = useSelector(getSavingStatus);
  const isLoading = useSelector(getIsLoading);
  const movedXBlockParams = useSelector(getMovedXBlockParams);
  const sequenceStatus = useSelector(getSequenceStatus);
  const { draftPreviewLink, publishedPreviewLink } = useSelector(getCourseSectionVertical);
  const courseVerticalChildren = useSelector(getCourseVerticalChildren);
  const staticFileNotices = useSelector(getStaticFileNotices);
  const navigate = useNavigate();
  const isTitleEditFormOpen = useSelector(state => state.courseUnit.isTitleEditFormOpen);
  const isQueryPending = useSelector(state => state.courseUnit.isQueryPending);
  const canEdit = useSelector(getCanEdit);
  const { currentlyVisibleToStudents } = courseUnit;
  const { sharedClipboardData, showPasteXBlock, showPasteUnit } = useCopyToClipboard(canEdit);
  const { canPasteComponent } = courseVerticalChildren;

  const unitTitle = courseUnit.metadata?.displayName || '';
  const sequenceId = courseUnit.ancestorInfo?.ancestors[0].id;

  const headerNavigationsActions = {
    handleViewLive: () => {
      window.open(publishedPreviewLink, '_blank');
    },
    handlePreview: () => {
      window.open(draftPreviewLink, '_blank');
    },
  };

  const handleInternetConnectionFailed = () => {
    setInternetConnectionError(true);
  };

  const handleTitleEdit = () => {
    dispatch(changeEditTitleFormOpen(!isTitleEditFormOpen));
  };

  const handleConfigureSubmit = (id, isVisible, groupAccess, closeModalFn) => {
    dispatch(editCourseUnitVisibilityAndData(id, PUBLISH_TYPES.republish, isVisible, groupAccess, true, blockId));
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

  const handleCreateNewCourseXBlock = (body, callback) => (
    dispatch(createNewCourseXBlock(body, callback, blockId))
  );

  const unitXBlockActions = {
    handleDelete: (XBlockId) => {
      dispatch(deleteUnitItemQuery(blockId, XBlockId));
    },
    handleDuplicate: (XBlockId) => {
      dispatch(duplicateUnitItemQuery(blockId, XBlockId));
    },
  };

  const handleXBlockDragAndDrop = (xblockListIds, restoreCallback) => {
    dispatch(setXBlockOrderListQuery(blockId, xblockListIds, restoreCallback));
  };

  const handleRollbackMovedXBlock = () => {
    dispatch(rollbackUnitItemQuery(blockId, movedXBlockParams.sourceLocator, movedXBlockParams.title));
  };

  const handleCloseXBlockMovedAlert = () => {
    dispatch(updateMovedXBlockParams({ isSuccess: false }));
  };

  const handleNavigateToTargetUnit = () => {
    const correctInternalRoute = createCorrectInternalRoute(`/course/${courseId}/container/${movedXBlockParams.targetParentLocator}`);
    navigate(correctInternalRoute);
  };

  useEffect(() => {
    if (savingStatus === RequestStatus.SUCCESSFUL) {
      dispatch(updateQueryPendingStatus(true));
    } else if (savingStatus === RequestStatus.FAILED && !hasInternetConnectionError) {
      toggleErrorAlert(true);
    }
  }, [savingStatus]);

  useEffect(() => {
    dispatch(fetchCourseUnitQuery(blockId));
    dispatch(fetchCourseSectionVerticalData(blockId, sequenceId));
    dispatch(fetchCourseVerticalChildrenData(blockId));

    handleNavigate(sequenceId);
    dispatch(updateMovedXBlockParams({ isSuccess: false }));
  }, [courseId, blockId, sequenceId]);

  return {
    sequenceId,
    courseUnit,
    unitTitle,
    sequenceStatus,
    savingStatus,
    isQueryPending,
    isErrorAlert,
    staticFileNotices,
    currentlyVisibleToStudents,
    isLoading,
    isTitleEditFormOpen,
    isInternetConnectionAlertFailed: savingStatus === RequestStatus.FAILED,
    sharedClipboardData,
    showPasteXBlock,
    showPasteUnit,
    handleInternetConnectionFailed,
    unitXBlockActions,
    headerNavigationsActions,
    handleTitleEdit,
    handleTitleEditSubmit,
    handleCreateNewCourseXBlock,
    handleConfigureSubmit,
    courseVerticalChildren,
    handleXBlockDragAndDrop,
    handleRollbackMovedXBlock,
    handleCloseXBlockMovedAlert,
    movedXBlockParams,
    handleNavigateToTargetUnit,
    canPasteComponent,
  };
};
