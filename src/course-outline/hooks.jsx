import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useToggle } from '@openedx/paragon';
import { getConfig } from '@edx/frontend-platform';
import { useQueryClient } from '@tanstack/react-query';

import moment from 'moment';
import { getSavingStatus as getGenericSavingStatus } from '@src/generic/data/selectors';
import { RequestStatus } from '@src/data/constants';
import { useUnlinkDownstream } from '@src/generic/unlink-modal';

import { useCourseAuthoringContext } from '@src/CourseAuthoringContext';
import { ContainerType } from '@src/generic/key-utils';
import { COURSE_BLOCK_NAMES } from './constants';
import {
  setCurrentItem,
  setCurrentSection,
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
  getCurrentItem,
  getCurrentSection,
  getCurrentSubsection,
  getCustomRelativeDatesActiveFlag,
  getErrors,
  getCreatedOn,
} from './data/selectors';
import {
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
  pasteClipboardContent,
  dismissNotificationQuery,
  syncDiscussionsTopics,
} from './data/thunk';
import { containerComparisonQueryKeys } from '../container-comparison/data/apiHooks';

const useCourseOutline = ({ courseId }) => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const { handleAddSection } = useCourseAuthoringContext();

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
  const currentItem = useSelector(getCurrentItem);
  const currentSection = useSelector(getCurrentSection);
  const currentSubsection = useSelector(getCurrentSubsection);
  const isCustomRelativeDatesActive = useSelector(getCustomRelativeDatesActiveFlag);
  const genericSavingStatus = useSelector(getGenericSavingStatus);
  const errors = useSelector(getErrors);

  const [isEnableHighlightsModalOpen, openEnableHighlightsModal, closeEnableHighlightsModal] = useToggle(false);
  const [isSectionsExpanded, setSectionsExpanded] = useState(true);
  const [isDisabledReindexButton, setDisableReindexButton] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [isHighlightsModalOpen, openHighlightsModal, closeHighlightsModal] = useToggle(false);
  const [isPublishModalOpen, openPublishModal, closePublishModal] = useToggle(false);
  const [isConfigureModalOpen, openConfigureModal, closeConfigureModal] = useToggle(false);
  const [isDeleteModalOpen, openDeleteModal, closeDeleteModal] = useToggle(false);
  const [isUnlinkModalOpen, openUnlinkModal, closeUnlinkModal] = useToggle(false);

  const isSavingStatusFailed = savingStatus === RequestStatus.FAILED || genericSavingStatus === RequestStatus.FAILED;

  const handlePasteClipboardClick = (parentLocator, sectionId) => {
    dispatch(pasteClipboardContent(parentLocator, sectionId));
  };

  const resetScrollState = () => {
    dispatch(resetScrollField());
  };

  const headerNavigationsActions = {
    handleNewSection: () => {
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
    // Invalidate container diff queries to update sync diff preview
    queryClient.invalidateQueries({ queryKey: containerComparisonQueryKeys.course(courseId) });
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

  const { mutateAsync: unlinkDownstream } = useUnlinkDownstream();

  const handleUnlinkItemSubmit = async () => {
    // istanbul ignore if: this should never happen
    if (!currentItem.id) {
      return;
    }

    await unlinkDownstream(currentItem.id);
    dispatch(fetchCourseOutlineIndexQuery(courseId));
    closeUnlinkModal();
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
    isInternetConnectionAlertFailed: isSavingStatusFailed,
    handleInternetConnectionFailed,
    handleOpenHighlightsModal,
    isHighlightsModalOpen,
    closeHighlightsModal,
    courseName: courseStructure?.displayName,
    isDeleteModalOpen,
    closeDeleteModal,
    openDeleteModal,
    isUnlinkModalOpen,
    closeUnlinkModal,
    openUnlinkModal,
    handleDeleteItemSubmit,
    handleUnlinkItemSubmit,
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
