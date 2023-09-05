/* eslint-disable no-undef */
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useToggle } from '@edx/paragon';

import { RequestStatus } from '../data/constants';
import { updateSavingStatus } from './data/slice';
import {
  getLoadingStatus,
  getOutlineIndexData,
  getSavingStatus,
  getStatusBarData,
  // getSectionsList,
} from './data/selectors';
import {
  // deleteCourseSectionQuery,
  editCourseSectionQuery,
  duplicateCourseSectionQuery,
  enableCourseHighlightsEmailsQuery,
  fetchCourseBestPracticesQuery,
  fetchCourseLaunchQuery,
  fetchCourseOutlineIndexQuery,
  fetchCourseReindexQuery,
} from './data/thunk';

const useCourseOutline = ({ courseId }) => {
  const dispatch = useDispatch();

  const { reindexLink } = useSelector(getOutlineIndexData);
  const { outlineIndexLoadingStatus, reIndexLoadingStatus } = useSelector(getLoadingStatus);
  const statusBarData = useSelector(getStatusBarData);
  const savingStatus = useSelector(getSavingStatus);
  // const sectionsList = useSelector(getSectionsList);

  const [isEnableHighlightsModalOpen, openEnableHighlightsModal, closeEnableHighlightsModal] = useToggle(false);
  const [isSectionsExpanded, setSectionsExpanded] = useState(false);
  const [isDisabledReindexButton, setDisableReindexButton] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [isPublishModalOpen, openPublishModal, closePublishModal] = useToggle(false);
  const [isDeleteModalOpen, openDeleteModal, closeDeleteModal] = useToggle(false);

  const headerNavigationsActions = {
    handleNewSection: () => {
      // TODO add handler
    },
    handleReIndex: () => {
      setDisableReindexButton(true);
      setShowSuccessAlert(false);
      setShowErrorAlert(false);

      dispatch(fetchCourseReindexQuery(courseId, reindexLink)).then(() => {
        setDisableReindexButton(false);
      });
    },
    handleExpandAll: () => {
      setSectionsExpanded((prevState) => !prevState);
    },
    handleViewLive: () => {
      // TODO add handler
    },
  };

  const handleEnableHighlightsSubmit = () => {
    dispatch(updateSavingStatus({ status: RequestStatus.PENDING }));
    dispatch(enableCourseHighlightsEmailsQuery(courseId));
    closeEnableHighlightsModal();
  };

  const handleInternetConnectionFailed = () => {
    dispatch(updateSavingStatus({ status: RequestStatus.FAILED }));
  };

  const handlePublishSectionSubmit = () => {
    // dispatch(publishCourseSectionQuery(currentSection.id));

    closePublishModal();
  };

  const handleEditSectionSubmit = (sectionId, displayName) => {
    dispatch(editCourseSectionQuery(sectionId, displayName));
  };

  const handleDeleteSectionSubmit = () => {
    // dispatch(deleteCourseSectionQuery(currentSection.id));
    closeDeleteModal();
  };

  const handleDuplicateSectionSubmit = () => {
    dispatch(duplicateCourseSectionQuery(currentSection.id, courseStructure.id));
  };

  useEffect(() => {
    dispatch(fetchCourseOutlineIndexQuery(courseId));
    dispatch(fetchCourseBestPracticesQuery({ courseId }));
    dispatch(fetchCourseLaunchQuery({ courseId }));
  }, [courseId]);

  useEffect(() => {
    if (reIndexLoadingStatus === RequestStatus.FAILED) {
      setShowErrorAlert(true);
    }

    if (reIndexLoadingStatus === RequestStatus.SUCCESSFUL) {
      setShowSuccessAlert(true);
    }
  }, [reIndexLoadingStatus]);

  return {
    savingStatus,
    isLoading: outlineIndexLoadingStatus === RequestStatus.IN_PROGRESS,
    isReIndexShow: Boolean(reindexLink),
    showSuccessAlert,
    showErrorAlert,
    isDisabledReindexButton,
    isSectionsExpanded,
    isPublishModalOpen,
    openPublishModal,
    closePublishModal,
    headerNavigationsActions,
    handleEnableHighlightsSubmit,
    handlePublishSectionSubmit,
    handleEditSectionSubmit,
    statusBarData,
    isEnableHighlightsModalOpen,
    openEnableHighlightsModal,
    closeEnableHighlightsModal,
    isInternetConnectionAlertFailed: savingStatus === RequestStatus.FAILED,
    handleInternetConnectionFailed,
    handleOpenHighlightsModal,
    isHighlightsModalOpen,
    closeHighlightsModal,
    courseName: courseStructure?.displayName,
    isDeleteModalOpen,
    closeDeleteModal,
    openDeleteModal,
    handleDeleteSectionSubmit,
    handleDuplicateSectionSubmit,
  };
};

// eslint-disable-next-line import/prefer-default-export
export { useCourseOutline };
