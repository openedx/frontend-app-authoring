import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useToggle } from '@edx/paragon';
import { useNavigate } from 'react-router-dom';
import { getConfig } from '@edx/frontend-platform';

import { RequestStatus } from '../data/constants';
import { COURSE_BLOCK_NAMES } from './constants';
import {
  setCurrentItem,
  setCurrentSection,
  updateSavingStatus,
} from './data/slice';
import {
  getLoadingStatus,
  getOutlineIndexData,
  getSavingStatus,
  getStatusBarData,
  getSectionsList,
  getCourseActions,
  getCurrentItem,
  getCurrentSection,
  getCurrentSubsection,
} from './data/selectors';
import {
  addNewSectionQuery,
  addNewSubsectionQuery,
  addNewUnitQuery,
  deleteCourseSectionQuery,
  deleteCourseSubsectionQuery,
  deleteCourseUnitQuery,
  editCourseItemQuery,
  duplicateSectionQuery,
  duplicateSubsectionQuery,
  duplicateUnitQuery,
  enableCourseHighlightsEmailsQuery,
  fetchCourseBestPracticesQuery,
  fetchCourseLaunchQuery,
  fetchCourseOutlineIndexQuery,
  fetchCourseReindexQuery,
  publishCourseItemQuery,
  updateCourseSectionHighlightsQuery,
  configureCourseSectionQuery,
  setSectionOrderListQuery,
  setSubsectionOrderListQuery,
} from './data/thunk';

const useCourseOutline = ({ courseId }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { reindexLink, courseStructure, lmsLink } = useSelector(getOutlineIndexData);
  const { outlineIndexLoadingStatus, reIndexLoadingStatus } = useSelector(getLoadingStatus);
  const statusBarData = useSelector(getStatusBarData);
  const savingStatus = useSelector(getSavingStatus);
  const courseActions = useSelector(getCourseActions);
  const sectionsList = useSelector(getSectionsList);
  const currentItem = useSelector(getCurrentItem);
  const currentSection = useSelector(getCurrentSection);
  const currentSubsection = useSelector(getCurrentSubsection);

  const [isEnableHighlightsModalOpen, openEnableHighlightsModal, closeEnableHighlightsModal] = useToggle(false);
  const [isSectionsExpanded, setSectionsExpanded] = useState(true);
  const [isDisabledReindexButton, setDisableReindexButton] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [isHighlightsModalOpen, openHighlightsModal, closeHighlightsModal] = useToggle(false);
  const [isPublishModalOpen, openPublishModal, closePublishModal] = useToggle(false);
  const [isConfigureModalOpen, openConfigureModal, closeConfigureModal] = useToggle(false);
  const [isDeleteModalOpen, openDeleteModal, closeDeleteModal] = useToggle(false);

  const handleNewSectionSubmit = () => {
    dispatch(addNewSectionQuery(courseStructure.id));
  };

  const handleNewSubsectionSubmit = (sectionId) => {
    dispatch(addNewSubsectionQuery(sectionId));
  };

  const getUnitUrl = (locator) => {
    if (process.env.ENABLE_UNIT_PAGE === 'true') {
      return `/course/container/${locator}`;
    }
    return `${getConfig().STUDIO_BASE_URL}/container/${locator}`;
  };

  const openUnitPage = (locator) => {
    const url = getUnitUrl(locator);
    if (process.env.ENABLE_UNIT_PAGE === 'true') {
      navigate(url);
    } else {
      window.location.assign(url);
    }
  };

  const handleNewUnitSubmit = (subsectionId) => {
    dispatch(addNewUnitQuery(subsectionId, openUnitPage));
  };

  const headerNavigationsActions = {
    handleNewSection: handleNewSectionSubmit,
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
    lmsLink,
  };

  const handleEnableHighlightsSubmit = () => {
    dispatch(enableCourseHighlightsEmailsQuery(courseId));
    closeEnableHighlightsModal();
  };

  const handleInternetConnectionFailed = () => {
    dispatch(updateSavingStatus({ status: RequestStatus.FAILED }));
  };

  const handleOpenHighlightsModal = (section) => {
    dispatch(setCurrentItem(section));
    dispatch(setCurrentSection(section));
    openHighlightsModal();
  };

  const handleHighlightsFormSubmit = (highlights) => {
    const dataToSend = Object.values(highlights).filter(Boolean);
    dispatch(updateCourseSectionHighlightsQuery(currentItem.id, dataToSend));

    closeHighlightsModal();
  };

  const handlePublishItemSubmit = () => {
    dispatch(publishCourseItemQuery(currentItem.id, currentSection.id));

    closePublishModal();
  };

  const handleConfigureSectionSubmit = (isVisibleToStaffOnly, startDatetime) => {
    dispatch(configureCourseSectionQuery(currentSection.id, isVisibleToStaffOnly, startDatetime));

    closeConfigureModal();
  };

  const handleEditSubmit = (itemId, sectionId, displayName) => {
    dispatch(editCourseItemQuery(itemId, sectionId, displayName));
  };

  const handleDeleteItemSubmit = () => {
    switch (currentItem.category) {
    case COURSE_BLOCK_NAMES.chapter.id:
      dispatch(deleteCourseSectionQuery(currentItem.id));
      break;
    case COURSE_BLOCK_NAMES.sequential.id:
      dispatch(deleteCourseSubsectionQuery(currentItem.id, currentSection.id));
      break;
    case COURSE_BLOCK_NAMES.vertical.id:
      dispatch(deleteCourseUnitQuery(
        currentItem.id,
        currentSubsection.id,
        currentSection.id,
      ));
      break;
    default:
      return;
    }
    closeDeleteModal();
  };

  const handleDuplicateSectionSubmit = () => {
    dispatch(duplicateSectionQuery(currentSection.id, courseStructure.id));
  };

  const handleDuplicateSubsectionSubmit = () => {
    dispatch(duplicateSubsectionQuery(currentSubsection.id, currentSection.id));
  };

  const handleDuplicateUnitSubmit = () => {
    dispatch(duplicateUnitQuery(currentItem.id, currentSubsection.id, currentSection.id));
  };

  const handleSectionDragAndDrop = (sectionListIds, restoreCallback) => {
    dispatch(setSectionOrderListQuery(courseId, sectionListIds, restoreCallback));
  };

  const handleSubsectionDragAndDrop = (sectionId, subsectionListIds, restoreCallback) => {
    dispatch(setSubsectionOrderListQuery(courseId, sectionId, subsectionListIds, restoreCallback));
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
    courseActions,
    savingStatus,
    sectionsList,
    isLoading: outlineIndexLoadingStatus === RequestStatus.IN_PROGRESS,
    isReIndexShow: Boolean(reindexLink),
    showSuccessAlert,
    showErrorAlert,
    isDisabledReindexButton,
    isSectionsExpanded,
    isPublishModalOpen,
    openPublishModal,
    closePublishModal,
    isConfigureModalOpen,
    openConfigureModal,
    closeConfigureModal,
    headerNavigationsActions,
    handleEnableHighlightsSubmit,
    handleHighlightsFormSubmit,
    handleConfigureSectionSubmit,
    handlePublishItemSubmit,
    handleEditSubmit,
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
    handleDeleteItemSubmit,
    handleDuplicateSectionSubmit,
    handleDuplicateSubsectionSubmit,
    handleDuplicateUnitSubmit,
    handleNewSectionSubmit,
    handleNewSubsectionSubmit,
    getUnitUrl,
    openUnitPage,
    handleNewUnitSubmit,
    handleSectionDragAndDrop,
    handleSubsectionDragAndDrop,
  };
};

// eslint-disable-next-line import/prefer-default-export
export { useCourseOutline };
