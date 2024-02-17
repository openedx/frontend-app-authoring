import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useToggle } from '@openedx/paragon';
import { getConfig } from '@edx/frontend-platform';

import { RequestStatus } from '../data/constants';
import { COURSE_BLOCK_NAMES } from './constants';
import { useBroadcastChannel } from '../generic/broadcast-channel/hooks';
import {
  setCurrentItem,
  setCurrentSection,
  updateSavingStatus,
  updateClipboardContent,
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
  getCustomRelativeDatesActiveFlag,
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
  configureCourseSubsectionQuery,
  configureCourseUnitQuery,
  setSectionOrderListQuery,
  setVideoSharingOptionQuery,
  setSubsectionOrderListQuery,
  setUnitOrderListQuery,
  setClipboardContent,
  pasteClipboardContent,
  dismissNotificationQuery,
} from './data/thunk';

const useCourseOutline = ({ courseId }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    reindexLink,
    courseStructure,
    lmsLink,
    notificationDismissUrl,
    discussionsSettings,
    discussionsIncontextFeedbackUrl,
    discussionsIncontextLearnmoreUrl,
    deprecatedBlocksInfo,
    proctoringErrors,
    mfeProctoredExamSettingsUrl,
    advanceSettingsUrl,
  } = useSelector(getOutlineIndexData);
  const { outlineIndexLoadingStatus, reIndexLoadingStatus } = useSelector(getLoadingStatus);
  const statusBarData = useSelector(getStatusBarData);
  const savingStatus = useSelector(getSavingStatus);
  const courseActions = useSelector(getCourseActions);
  const sectionsList = useSelector(getSectionsList);
  const currentItem = useSelector(getCurrentItem);
  const currentSection = useSelector(getCurrentSection);
  const currentSubsection = useSelector(getCurrentSubsection);
  const isCustomRelativeDatesActive = useSelector(getCustomRelativeDatesActiveFlag);

  const [isEnableHighlightsModalOpen, openEnableHighlightsModal, closeEnableHighlightsModal] = useToggle(false);
  const [isSectionsExpanded, setSectionsExpanded] = useState(true);
  const [isDisabledReindexButton, setDisableReindexButton] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [isHighlightsModalOpen, openHighlightsModal, closeHighlightsModal] = useToggle(false);
  const [isPublishModalOpen, openPublishModal, closePublishModal] = useToggle(false);
  const [isConfigureModalOpen, openConfigureModal, closeConfigureModal] = useToggle(false);
  const [isDeleteModalOpen, openDeleteModal, closeDeleteModal] = useToggle(false);
  const clipboardBroadcastChannel = useBroadcastChannel('studio_clipboard_channel', (message) => {
    dispatch(updateClipboardContent(message));
  });

  const handleCopyToClipboardClick = (usageKey) => {
    dispatch(setClipboardContent(usageKey, clipboardBroadcastChannel.postMessage));
  };

  const handlePasteClipboardClick = (parentLocator, sectionId) => {
    dispatch(pasteClipboardContent(parentLocator, sectionId));
  };

  const handleNewSectionSubmit = () => {
    dispatch(addNewSectionQuery(courseStructure.id));
  };

  const handleNewSubsectionSubmit = (sectionId) => {
    dispatch(addNewSubsectionQuery(sectionId));
  };

  const getUnitUrl = (locator) => {
    if (getConfig().ENABLE_UNIT_PAGE === 'true') {
      return `/course/${courseId}/container/${locator}`;
    }
    return `${getConfig().STUDIO_BASE_URL}/container/${locator}`;
  };

  const openUnitPage = (locator) => {
    const url = getUnitUrl(locator);
    if (getConfig().ENABLE_UNIT_PAGE === 'true') {
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

  const handleConfigureModalClose = () => {
    closeConfigureModal();
    // reset the currentItem so the ConfigureModal's state is also reset
    dispatch(setCurrentItem({}));
  };

  const handleConfigureItemSubmit = (...arg) => {
    switch (currentItem.category) {
    case COURSE_BLOCK_NAMES.chapter.id:
      dispatch(configureCourseSectionQuery(currentSection.id, ...arg));
      break;
    case COURSE_BLOCK_NAMES.sequential.id:
      dispatch(configureCourseSubsectionQuery(currentItem.id, currentSection.id, ...arg));
      break;
    case COURSE_BLOCK_NAMES.vertical.id:
      dispatch(configureCourseUnitQuery(currentItem.id, currentSection.id, ...arg));
      break;
    default:
      return;
    }
    handleConfigureModalClose();
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
    dispatch(setSubsectionOrderListQuery(sectionId, subsectionListIds, restoreCallback));
  };

  const handleVideoSharingOptionChange = (value) => {
    dispatch(setVideoSharingOptionQuery(courseId, value));
  };

  const handleUnitDragAndDrop = (sectionId, subsectionId, unitListIds, restoreCallback) => {
    dispatch(setUnitOrderListQuery(sectionId, subsectionId, unitListIds, restoreCallback));
  };

  const handleDismissNotification = () => {
    dispatch(dismissNotificationQuery(notificationDismissUrl));
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
    isCustomRelativeDatesActive,
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
    handleConfigureModalClose,
    headerNavigationsActions,
    handleEnableHighlightsSubmit,
    handleHighlightsFormSubmit,
    handleConfigureItemSubmit,
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
    handleVideoSharingOptionChange,
    handleUnitDragAndDrop,
    handleCopyToClipboardClick,
    handlePasteClipboardClick,
    notificationDismissUrl,
    discussionsSettings,
    discussionsIncontextFeedbackUrl,
    discussionsIncontextLearnmoreUrl,
    deprecatedBlocksInfo,
    proctoringErrors,
    mfeProctoredExamSettingsUrl,
    handleDismissNotification,
    advanceSettingsUrl,
  };
};

// eslint-disable-next-line import/prefer-default-export
export { useCourseOutline };
