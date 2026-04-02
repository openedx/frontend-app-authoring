import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useToggle } from '@openedx/paragon';
import { getConfig } from '@edx/frontend-platform';

import moment from 'moment';
import { getSavingStatus as getGenericSavingStatus } from '@src/generic/data/selectors';
import { RequestStatus } from '@src/data/constants';

import { useCourseAuthoringContext } from '@src/CourseAuthoringContext';
import { ContainerType, getBlockType } from '@src/generic/key-utils';
import { useOutlineSidebarContext } from '@src/course-outline/outline-sidebar/OutlineSidebarContext';
import { useUnlinkDownstream } from '@src/generic/unlink-modal';
import {
  useConfigureSection,
  useConfigureSubsection,
  useConfigureUnit,
  usePasteItem,
  useUpdateCourseSectionHighlights,
} from '@src/course-outline/data/apiHooks';
import { COURSE_BLOCK_NAMES } from './constants';
import {
  updateSavingStatus,
} from './data/slice';
import {
  getLoadingStatus,
  getOutlineIndexData,
  getSavingStatus,
  getStatusBarData,
  getCourseActions,
  getCustomRelativeDatesActiveFlag,
  getErrors,
  getCreatedOn,
} from './data/selectors';
import {
  enableCourseHighlightsEmailsQuery,
  fetchCourseBestPracticesQuery,
  fetchCourseLaunchQuery,
  fetchCourseOutlineIndexQuery,
  fetchCourseReindexQuery,
  setVideoSharingOptionQuery,
  dismissNotificationQuery,
  syncDiscussionsTopics,
} from './data/thunk';

const useCourseOutline = ({ courseId }) => {
  const dispatch = useDispatch();
  const {
    handleAddBlock,
    setCurrentSelection,
    currentSelection,
    currentUnlinkModalData,
    closeUnlinkModal,
    isDuplicatingItem,
    isDeleteModalOpen,
    openDeleteModal,
    closeDeleteModal,
    getHandleDeleteItemSubmit,
    handleDuplicateSectionSubmit,
    handleDuplicateSubsectionSubmit,
    handleDuplicateUnitSubmit,
    handleSectionDragAndDrop,
    handleSubsectionDragAndDrop,
    handleUnitDragAndDrop,
  } = useCourseAuthoringContext();
  const { selectedContainerState, clearSelection } = useOutlineSidebarContext();

  const handleDeleteItemSubmit = getHandleDeleteItemSubmit(() => {
    if (selectedContainerState.currentId === currentSelection?.currentId) {
      clearSelection();
    }
  });

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
  
  const isCustomRelativeDatesActive = useSelector(getCustomRelativeDatesActiveFlag);
  const genericSavingStatus = useSelector(getGenericSavingStatus);
  const errors = useSelector(getErrors);

  const [isEnableHighlightsModalOpen, openEnableHighlightsModal, closeEnableHighlightsModal] = useToggle(false);
  const [isSectionsExpanded, setSectionsExpanded] = useState(true);
  const [isDisabledReindexButton, setDisableReindexButton] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [isHighlightsModalOpen, openHighlightsModal, closeHighlightsModal] = useToggle(false);
  const [isConfigureModalOpen, openConfigureModal, closeConfigureModal] = useToggle(false);

  const isSavingStatusFailed = savingStatus === RequestStatus.FAILED || genericSavingStatus === RequestStatus.FAILED;

  const { mutate: pasteClipboardContent, isPending: isPasting } = usePasteItem(courseId);
  const handlePasteClipboardClick = (parentLocator, subsectionId, sectionId) => {
    pasteClipboardContent({
      parentLocator,
      subsectionId,
      sectionId,
    });
  };

  const headerNavigationsActions = {
    handleNewSection: () => {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      handleAddBlock.mutateAsync({
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
      currentId: section.id,
      sectionId: section.id,
    });
    openHighlightsModal();
  };

  const {
    mutate: updateCourseSectionHighlights,
    isPending: isSectionHighlightsUpdatePending,
  } = useUpdateCourseSectionHighlights();
  const handleHighlightsFormSubmit = (highlights) => {
    const dataToSend = Object.values(highlights).filter(Boolean);
    updateCourseSectionHighlights({
      sectionId: currentSelection?.currentId,
      highlights: dataToSend,
    });

    closeHighlightsModal();
  };

  const handleConfigureModalClose = () => {
    closeConfigureModal();
    // reset the currentSelection?.current so the ConfigureModal's state is also reset
    setCurrentSelection(undefined);
  };

  const { mutateAsync: unlinkDownstream } = useUnlinkDownstream();

  /** Handle the submit of the item unlinking XBlock from library counterpart. */
  const handleUnlinkItemSubmit = useCallback(async () => {
    // istanbul ignore if: this should never happen
    if (!currentUnlinkModalData) {
      return;
    }

    await unlinkDownstream({
      downstreamBlockId: currentUnlinkModalData.value.id,
      sectionId: currentUnlinkModalData.sectionId,
      subsectionId: currentUnlinkModalData.subsectionId,
    }, {
      onSuccess: () => {
        closeUnlinkModal();
      },
    });
  }, [currentUnlinkModalData, unlinkDownstream, closeUnlinkModal]);

  const {
    mutate: configureCourseSection,
    isPending: isSectionConfigurePending,
  } = useConfigureSection();
  const {
    mutate: configureCourseSubsection,
    isPending: isSubsectionConfigurePending,
  } = useConfigureSubsection();
  const {
    mutate: configureCourseUnit,
    isPending: isUnitConfigurePending,
  } = useConfigureUnit();
  const isConfigureOpPending = isSectionConfigurePending || isSubsectionConfigurePending || isUnitConfigurePending;
  const handleConfigureItemSubmit = (variables) => {
    const category = getBlockType(currentSelection.currentId);
    switch (category) {
      case COURSE_BLOCK_NAMES.chapter.id:
        configureCourseSection({
          sectionId: currentSelection?.sectionId,
          ...variables,
        });
        break;
      case COURSE_BLOCK_NAMES.sequential.id:
        configureCourseSubsection({
          itemId: currentSelection?.currentId,
          sectionId: currentSelection?.sectionId,
          ...variables,
        });
        break;
      case COURSE_BLOCK_NAMES.vertical.id:
        configureCourseUnit({
          unitId: currentSelection?.currentId,
          sectionId: currentSelection?.sectionId,
          ...variables,
        });
        break;
      default:
        // istanbul ignore next
        throw new Error('Unsupported block type');
    }
    handleConfigureModalClose();
  };

  const handleVideoSharingOptionChange = (value) => {
    dispatch(setVideoSharingOptionQuery(courseId, value));
  };

  const handleDismissNotification = () => {
    dispatch(dismissNotificationQuery(`${getConfig().STUDIO_BASE_URL}${notificationDismissUrl}`));
  };

  useEffect(() => {
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
    isConfigureOpPending,
    headerNavigationsActions,
    handleEnableHighlightsSubmit,
    handleHighlightsFormSubmit,
    handleConfigureItemSubmit,
    statusBarData,
    isEnableHighlightsModalOpen,
    isSectionHighlightsUpdatePending,
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
    isDuplicatingItem,
    handleDuplicateUnitSubmit,
    handleVideoSharingOptionChange,
    handlePasteClipboardClick,
    isPasting,
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
    handleUnlinkItemSubmit,
  };
};

export { useCourseOutline };
