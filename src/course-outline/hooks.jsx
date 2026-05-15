import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useToggle } from '@openedx/paragon';

import { getSavingStatus as getGenericSavingStatus } from '@src/generic/data/selectors';
import { RequestStatus } from '@src/data/constants';

import { useCourseAuthoringContext } from '@src/CourseAuthoringContext';
import { useCourseOutlineContext } from './CourseOutlineContext';
import { useOutlineSidebarContext } from '@src/course-outline/outline-sidebar/OutlineSidebarContext';
import { useUnlinkDownstream } from '@src/generic/unlink-modal';
import { ContainerType } from '@src/generic/key-utils';
import { COURSE_BLOCK_NAMES } from './constants';

const useCourseOutline = ({ courseId }) => {
  const { currentUnlinkModalData, closeUnlinkModal } = useCourseAuthoringContext();
  const { selectedContainerState, clearSelection } = useOutlineSidebarContext();

  const {
    handleAddBlock,
    isDeleteModalOpen,
    openDeleteModal,
    closeDeleteModal,
    outlineIndexData,
    loadingStatus,
    statusBarData,
    savingStatus,
    courseActions,
    isCustomRelativeDatesActive,
    errors,
    deleteCurrentSelection,
    duplicateCurrentSelection,
    configureCurrentSelection,
    pasteClipboardContent: pasteViaState,
    updateHighlightsForCurrentSelection,
    enableHighlightsEmails,
    changeVideoSharingOption,
    dismissNotification,
    reindexCourse,
    setSavingStatus,
    // Action target selection (aliased for backward compat)
    actionTargetSelection: currentSelection,
    setActionTargetSelection: setCurrentSelection,
  } = useCourseOutlineContext();
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
  } = outlineIndexData || {};
  const { outlineIndexIsLoading, outlineIndexIsDenied, reIndexLoadingStatus } = loadingStatus;
  const genericSavingStatus = useSelector(getGenericSavingStatus);

  const [isEnableHighlightsModalOpen, openEnableHighlightsModal, closeEnableHighlightsModal] = useToggle(false);
  const [isSectionsExpanded, setSectionsExpanded] = useState(true);
  const [isDisabledReindexButton, setDisableReindexButton] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [isHighlightsModalOpen, openHighlightsModal, closeHighlightsModal] = useToggle(false);
  const [isConfigureModalOpen, openConfigureModal, closeConfigureModal] = useToggle(false);

  const isSavingStatusFailed = savingStatus === RequestStatus.FAILED || genericSavingStatus === RequestStatus.FAILED;

  const handlePasteClipboardClick = (parentLocator, subsectionId, sectionId) => {
    pasteViaState(parentLocator, subsectionId, sectionId);
  };

  const headerNavigationsActions = {
    handleNewSection: async () => {
      // istanbul ignore next - we are using this for back compability with the plugin slot. we don't call it anymore.
      await handleAddBlock.mutateAsync({
        type: ContainerType.Chapter,
        parentLocator: courseStructure?.id,
        displayName: COURSE_BLOCK_NAMES.chapter.name,
      });
    },
    handleReIndex: () => {
      setDisableReindexButton(true);
      setShowSuccessAlert(false);
      reindexCourse().then(() => {
        setDisableReindexButton(false);
      });
    },
    handleExpandAll: () => {
      setSectionsExpanded((prevState) => !prevState);
    },
    lmsLink,
  };

  const handleDeleteItemSubmit = async () => {
    await deleteCurrentSelection(currentSelection);
    closeDeleteModal();
    if (selectedContainerState?.currentId === currentSelection?.currentId) {
      clearSelection();
    }
  };

  const handleEnableHighlightsSubmit = () => {
    enableHighlightsEmails();
    closeEnableHighlightsModal();
  };

  const handleInternetConnectionFailed = () => {
    setSavingStatus(RequestStatus.FAILED);
  };

  const handleOpenHighlightsModal = (section) => {
    setCurrentSelection({
      currentId: section.id,
      sectionId: section.id,
    });
    openHighlightsModal();
  };

  const handleHighlightsFormSubmit = (highlights) => {
    updateHighlightsForCurrentSelection(currentSelection, highlights);
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

  const handleConfigureItemSubmit = (variables) => {
    configureCurrentSelection(currentSelection, variables);
    handleConfigureModalClose();
  };

  const handleVideoSharingOptionChange = (value) => {
    changeVideoSharingOption(value);
  };

  const handleDismissNotification = () => {
    dismissNotification();
  };

  useEffect(() => {
    setShowSuccessAlert(reIndexLoadingStatus === RequestStatus.SUCCESSFUL);
  }, [reIndexLoadingStatus]);

  return {
    courseUsageKey: courseStructure?.id,
    courseActions,
    savingStatus,
    isCustomRelativeDatesActive,
    isLoading: outlineIndexIsLoading,
    isLoadingDenied: outlineIndexIsDenied,
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
    handleDuplicateSectionSubmit: () => duplicateCurrentSelection(currentSelection),
    handleDuplicateSubsectionSubmit: () => duplicateCurrentSelection(currentSelection),
    handleDuplicateUnitSubmit: () => duplicateCurrentSelection(currentSelection),
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
    errors,
    handleUnlinkItemSubmit,
  };
};

export { useCourseOutline };
