import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { RequestStatus } from '../data/constants';
import {
  createNewCourseXBlock,
  fetchCourseUnitQuery,
  editCourseItemQuery,
  fetchCourseSectionVerticalData,
  fetchCourseVerticalChildrenData,
  deleteUnitItemQuery,
  duplicateUnitItemQuery,
} from './data/thunk';
import {
  getCourseSectionVertical,
  getCourseVerticalChildren,
  getCourseUnitData,
  getLoadingStatus,
  getSavingStatus,
  getSequenceStatus,
} from './data/selectors';
import { changeEditTitleFormOpen, updateQueryPendingStatus } from './data/slice';

// eslint-disable-next-line import/prefer-default-export
export const useCourseUnit = ({ courseId, blockId }) => {
  const dispatch = useDispatch();

  const [isErrorAlert, toggleErrorAlert] = useState(false);
  const [hasInternetConnectionError, setInternetConnectionError] = useState(false);
  const courseUnit = useSelector(getCourseUnitData);
  const savingStatus = useSelector(getSavingStatus);
  const loadingStatus = useSelector(getLoadingStatus);
  const sequenceStatus = useSelector(getSequenceStatus);
  const { draftPreviewLink, publishedPreviewLink } = useSelector(getCourseSectionVertical);
  const courseVerticalChildren = useSelector(getCourseVerticalChildren);
  const navigate = useNavigate();
  const isTitleEditFormOpen = useSelector(state => state.courseUnit.isTitleEditFormOpen);
  const isQueryPending = useSelector(state => state.courseUnit.isQueryPending);
  const { currentlyVisibleToStudents } = courseUnit;

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

  const handleTitleEditSubmit = (displayName) => {
    if (unitTitle !== displayName) {
      dispatch(editCourseItemQuery(blockId, displayName, sequenceId));
    }

    handleTitleEdit();
  };

  const handleNavigate = (id) => {
    if (sequenceId) {
      navigate(`/course/${courseId}/container/${blockId}/${id}`, { replace: true });
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
  }, [courseId, blockId, sequenceId]);

  return {
    sequenceId,
    courseUnit,
    unitTitle,
    sequenceStatus,
    savingStatus,
    isQueryPending,
    isErrorAlert,
    currentlyVisibleToStudents,
    isLoading: loadingStatus.fetchUnitLoadingStatus === RequestStatus.IN_PROGRESS
      || loadingStatus.courseSectionVerticalLoadingStatus === RequestStatus.IN_PROGRESS,
    isTitleEditFormOpen,
    isInternetConnectionAlertFailed: savingStatus === RequestStatus.FAILED,
    handleInternetConnectionFailed,
    unitXBlockActions,
    headerNavigationsActions,
    handleTitleEdit,
    handleTitleEditSubmit,
    handleCreateNewCourseXBlock,
    courseVerticalChildren,
  };
};
