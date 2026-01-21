import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useToggle } from '@openedx/paragon';
import { getConfig } from '@edx/frontend-platform';

import moment from 'moment';
import { getSavingStatus as getGenericSavingStatus } from '@src/generic/data/selectors';
import { RequestStatus } from '@src/data/constants';

import { useCourseAuthoringContext } from '@src/CourseAuthoringContext';
import { ContainerType } from '@src/generic/key-utils';
import { COURSE_BLOCK_NAMES } from './constants';
import {
  resetScrollField,
  updateSavingStatus,
} from './data/slice';
import {
  getLoadingStatus,
  getOutlineIndexData,
  getSavingStatus,
  getStatusBarData,
  getSectionsList,
  getCourseActions,
  getCustomRelativeDatesActiveFlag,
  getErrors,
  getCreatedOn,
} from './data/selectors';
import {
  deleteCourseSectionQuery,
  deleteCourseSubsectionQuery,
  deleteCourseUnitQuery,
  duplicateSectionQuery,
  duplicateSubsectionQuery,
  duplicateUnitQuery,
  enableCourseHighlightsEmailsQuery,
  fetchCourseBestPracticesQuery,
  fetchCourseLaunchQuery,
  fetchCourseOutlineIndexQuery,
  fetchCourseReindexQuery,
  updateCourseSectionHighlightsQuery,
  configureCourseSectionQuery,
  configureCourseSubsectionQuery,
  configureCourseUnitQuery,
  setSectionOrderListQuery,
  setVideoSharingOptionQuery,
  setSubsectionOrderListQuery,
  setUnitOrderListQuery,
  pasteClipboardContent,
  dismissNotificationQuery,
  syncDiscussionsTopics,
} from './data/thunk';
import { useOutlineSidebarContext } from '@src/course-outline/outline-sidebar/OutlineSidebarContext';

const useCourseOutline = ({ courseId }) => {
  const dispatch = useDispatch();
  const { handleAddSection, setCurrentSelection, currentSelection } = useCourseAuthoringContext();
  const { selectedContainerId, clearSelection } = useOutlineSidebarContext();

  const {
    reindexLink,
    courseStructure,
    lmsLink,
    notificationDismissUrl,
    discussionsSettings,
    discussionsIncontextLearnmoreUrl,
    deprecatedBlocksInfo,
    proctoringErrors,
    mfeProctoredExamSettingsUrl,
    advanceSettingsUrl,
  } = useSelector(getOutlineIndexData);
  /** Course usage key is different than courseKey and useful in using as parentLocator for imported sections */
  const createdOn = useSelector(getCreatedOn);
  const { outlineIndexLoadingStatus, reIndexLoadingStatus } = useSelector(getLoadingStatus);
  const statusBarData = useSelector(getStatusBarData);
  const savingStatus = useSelector(getSavingStatus);
  const courseActions = useSelector(getCourseActions);
  const sectionsList = useSelector(getSectionsList);
  const isCustomRelativeDatesActive = useSelector(getCustomRelativeDatesActiveFlag);
  const genericSavingStatus = useSelector(getGenericSavingStatus);
  const errors = useSelector(getErrors);

  const [isEnableHighlightsModalOpen, openEnableHighlightsModal, closeEnableHighlightsModal] = useToggle(false);
  const [isSectionsExpanded, setSectionsExpanded] = useState(true);
  const [isDisabledReindexButton, setDisableReindexButton] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [isHighlightsModalOpen, openHighlightsModal, closeHighlightsModal] = useToggle(false);
  const [isConfigureModalOpen, openConfigureModal, closeConfigureModal] = useToggle(false);
  const [isDeleteModalOpen, openDeleteModal, closeDeleteModal] = useToggle(false);

  const isSavingStatusFailed = savingStatus === RequestStatus.FAILED || genericSavingStatus === RequestStatus.FAILED;

  const handlePasteClipboardClick = (parentLocator, sectionId) => {
    dispatch(pasteClipboardContent(parentLocator, sectionId));
  };

  const resetScrollState = () => {
    dispatch(resetScrollField());
  };

  const headerNavigationsActions = {
    handleNewSection: () => {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      handleAddSection.mutateAsync({
        type: ContainerType.Chapter,
        parentLocator: courseStructure?.id,
        displayName: COURSE_BLOCK_NAMES.chapter.name,
      });
    },
    handleReIndex: () => {
      setDisableReindexButton(true);
      setShowSuccessAlert(false);

      dispatch(fetchCourseReindexQuery(reindexLink)).then(() => {
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
    setCurrentSelection({
      current: section,
      section,
    });
    openHighlightsModal();
  };

  const handleHighlightsFormSubmit = (highlights) => {
    const dataToSend = Object.values(highlights).filter(Boolean);
    dispatch(updateCourseSectionHighlightsQuery(currentSelection?.current.id, dataToSend));

    closeHighlightsModal();
  };

  const handleConfigureModalClose = () => {
    closeConfigureModal();
    // reset the currentSelection?.current so the ConfigureModal's state is also reset
    setCurrentSelection(undefined)
  };

  const handleConfigureItemSubmit = (...arg) => {
    switch (currentSelection?.current.category) {
      case COURSE_BLOCK_NAMES.chapter.id:
        dispatch(configureCourseSectionQuery(currentSelection?.section.id, ...arg));
        break;
      case COURSE_BLOCK_NAMES.sequential.id:
        dispatch(configureCourseSubsectionQuery(currentSelection?.current.id, currentSelection?.section.id, ...arg));
        break;
      case COURSE_BLOCK_NAMES.vertical.id:
        dispatch(configureCourseUnitQuery(currentSelection?.current.id, currentSelection?.section.id, ...arg));
        break;
      default:
        return;
    }
    handleConfigureModalClose();
  };

  const handleDeleteItemSubmit = () => {
    switch (currentSelection?.current.category) {
      case COURSE_BLOCK_NAMES.chapter.id:
        dispatch(deleteCourseSectionQuery(currentSelection?.current.id));
        break;
      case COURSE_BLOCK_NAMES.sequential.id:
        dispatch(deleteCourseSubsectionQuery(currentSelection?.current.id, currentSelection?.section.id));
        break;
      case COURSE_BLOCK_NAMES.vertical.id:
        dispatch(deleteCourseUnitQuery(
          currentSelection?.current.id,
          currentSelection?.subsection.id,
          currentSelection?.section.id,
        ));
        break;
      default:
        return;
    }
    if (selectedContainerId === currentSelection?.current.id) {
      clearSelection();
    }
    closeDeleteModal();
  };

  const handleDuplicateSectionSubmit = () => {
    dispatch(duplicateSectionQuery(currentSelection?.section.id, courseStructure.id));
  };

  const handleDuplicateSubsectionSubmit = () => {
    dispatch(duplicateSubsectionQuery(currentSelection?.subsection.id, currentSelection?.section.id));
  };

  const handleDuplicateUnitSubmit = () => {
    dispatch(duplicateUnitQuery(currentSelection?.current.id, currentSelection?.subsection.id, currentSelection?.section.id));
  };

  const handleVideoSharingOptionChange = (value) => {
    dispatch(setVideoSharingOptionQuery(courseId, value));
  };

  const handleDismissNotification = () => {
    dispatch(dismissNotificationQuery(`${getConfig().STUDIO_BASE_URL}${notificationDismissUrl}`));
  };

  const handleSectionDragAndDrop = (
    sectionListIds,
    restoreSectionList,
  ) => {
    dispatch(setSectionOrderListQuery(
      courseId,
      sectionListIds,
      restoreSectionList,
    ));
  };

  const handleSubsectionDragAndDrop = (
    sectionId,
    prevSectionId,
    subsectionListIds,
    restoreSectionList,
  ) => {
    dispatch(setSubsectionOrderListQuery(
      sectionId,
      prevSectionId,
      subsectionListIds,
      restoreSectionList,
    ));
  };

  const handleUnitDragAndDrop = (
    sectionId,
    prevSectionId,
    subsectionId,
    unitListIds,
    restoreSectionList,
  ) => {
    dispatch(setUnitOrderListQuery(
      sectionId,
      subsectionId,
      prevSectionId,
      unitListIds,
      restoreSectionList,
    ));
  };

  useEffect(() => {
    dispatch(fetchCourseOutlineIndexQuery(courseId));
    dispatch(fetchCourseBestPracticesQuery({ courseId }));
    dispatch(fetchCourseLaunchQuery({ courseId }));
  }, [courseId]);

  useEffect(() => {
    if (createdOn && moment(new Date(createdOn)).isAfter(moment().subtract(31, 'days'))) {
      dispatch(syncDiscussionsTopics(courseId));
    }
  }, [createdOn, courseId]);

  useEffect(() => {
    setShowSuccessAlert(reIndexLoadingStatus === RequestStatus.SUCCESSFUL);
  }, [reIndexLoadingStatus]);

  return {
    courseUsageKey: courseStructure?.id,
    courseActions,
    savingStatus,
    sectionsList,
    isCustomRelativeDatesActive,
    isLoading: outlineIndexLoadingStatus === RequestStatus.IN_PROGRESS,
    isLoadingDenied: outlineIndexLoadingStatus === RequestStatus.DENIED,
    isReIndexShow: Boolean(reindexLink),
    showSuccessAlert,
    isDisabledReindexButton,
    isSectionsExpanded,
    isConfigureModalOpen,
    openConfigureModal,
    handleConfigureModalClose,
    headerNavigationsActions,
    handleEnableHighlightsSubmit,
    handleHighlightsFormSubmit,
    handleConfigureItemSubmit,
    statusBarData,
    isEnableHighlightsModalOpen,
    openEnableHighlightsModal,
    closeEnableHighlightsModal,
    isInternetConnectionAlertFailed: isSavingStatusFailed,
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
    handleVideoSharingOptionChange,
    handlePasteClipboardClick,
    notificationDismissUrl,
    discussionsSettings,
    discussionsIncontextLearnmoreUrl,
    deprecatedBlocksInfo,
    proctoringErrors,
    mfeProctoredExamSettingsUrl,
    handleDismissNotification,
    advanceSettingsUrl,
    genericSavingStatus,
    handleSectionDragAndDrop,
    handleSubsectionDragAndDrop,
    handleUnitDragAndDrop,
    errors,
    resetScrollState,
  };
};

export { useCourseOutline };
