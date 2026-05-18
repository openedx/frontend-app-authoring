import { useCallback, useEffect, useState } from 'react';
import { useToggle } from '@openedx/paragon';
import { RequestStatus } from '@src/data/constants';

import { useCourseAuthoringContext } from '@src/CourseAuthoringContext';
import { useCourseOutlineContext } from './CourseOutlineContext';
import { useOutlineSidebarContext } from '@src/course-outline/outline-sidebar/OutlineSidebarContext';
import { useUnlinkDownstream } from '@src/generic/unlink-modal';
import { ContainerType, getBlockType } from '@src/generic/key-utils';
import { COURSE_BLOCK_NAMES } from './constants';
import {
  useCreateCourseBlock,
  useDeleteCourseItem,
  useConfigureSection,
  useConfigureSubsection,
  useConfigureUnit,
  usePasteItem,
  useUpdateCourseSectionHighlights,
  useSetVideoSharingOption,
  useEnableCourseHighlightsEmails,
  useDismissNotification,
  useRestartIndexingOnCourse,
} from './data/apiHooks';

const useCourseOutline = () => {
  const { currentUnlinkModalData, closeUnlinkModal, courseId } = useCourseAuthoringContext();
  const { selectedContainerState, clearSelection } = useOutlineSidebarContext();

  const {
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
    actionTargetSelection,
    setActionTargetSelection,
    courseUsageKey,
    currentSelection,
    clearSelection: clearContextSelection,
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

  const handleAddBlock = useCreateCourseBlock(courseId);
  const deleteMutation = useDeleteCourseItem(courseId);
  const configureSectionMutation = useConfigureSection(courseId);
  const configureSubsectionMutation = useConfigureSubsection(courseId);
  const configureUnitMutation = useConfigureUnit(courseId);
  const pasteMutation = usePasteItem(courseId);
  const highlightsMutation = useUpdateCourseSectionHighlights(courseId);
  const enableHighlightsEmailsMutation = useEnableCourseHighlightsEmails(courseId);
  const videoSharingMutation = useSetVideoSharingOption(courseId);
  const dismissNotificationMutation = useDismissNotification(courseId);
  const reindexMutation = useRestartIndexingOnCourse(courseId);

  const [isEnableHighlightsModalOpen, openEnableHighlightsModal, closeEnableHighlightsModal] = useToggle(false);
  const [isSectionsExpanded, setSectionsExpanded] = useState(true);
  const [isDisabledReindexButton, setDisableReindexButton] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [isHighlightsModalOpen, openHighlightsModal, closeHighlightsModal] = useToggle(false);
  const [isConfigureModalOpen, openConfigureModal, closeConfigureModal] = useToggle(false);

  const isSavingStatusFailed = savingStatus === RequestStatus.FAILED;

  const handleDeleteItemSubmit = async () => {
    if (!actionTargetSelection?.currentId) { return; }
    try {
      const category = getBlockType(actionTargetSelection.currentId);
      switch (category) {
        case 'chapter':
          await deleteMutation.mutateAsync({ itemId: actionTargetSelection.currentId });
          break;
        case 'sequential':
          await deleteMutation.mutateAsync({
            itemId: actionTargetSelection.currentId,
            sectionId: actionTargetSelection.sectionId,
          });
          break;
        case 'vertical':
          await deleteMutation.mutateAsync({
            itemId: actionTargetSelection.currentId,
            subsectionId: actionTargetSelection.subsectionId,
            sectionId: actionTargetSelection.sectionId,
          });
          break;
        default:
          throw new Error(`Unrecognized category ${category}`);
      }
      closeDeleteModal();
      if (selectedContainerState?.currentId === actionTargetSelection?.currentId) {
        clearSelection();
      }
      if (currentSelection?.currentId === actionTargetSelection?.currentId) {
        clearContextSelection();
      }
    } catch {
      // Leave modal/selection unchanged on failure.
      // Toast/notification handled by useMutationWithProcessingNotification.
    }
  };

  const configureCurrentSelection = (selection, variables) => {
    if (!selection?.currentId) { return; }
    const category = getBlockType(selection.currentId);
    switch (category) {
      case 'chapter':
        configureSectionMutation.mutate({ sectionId: selection.sectionId, ...variables });
        break;
      case 'sequential':
        configureSubsectionMutation.mutate({
          itemId: selection.currentId,
          sectionId: selection.sectionId,
          ...variables,
        });
        break;
      case 'vertical':
        configureUnitMutation.mutate({ unitId: selection.currentId, sectionId: selection.sectionId, ...variables });
        break;
      default:
        throw new Error('Unsupported block type');
    }
  };

  const handlePasteClipboardClick = (parentLocator, subsectionId, sectionId) => {
    pasteMutation.mutate({ parentLocator, subsectionId, sectionId });
  };

  const handleEnableHighlightsSubmit = () => {
    enableHighlightsEmailsMutation.mutate();
    closeEnableHighlightsModal();
  };

  const handleVideoSharingOptionChange = (value) => {
    videoSharingMutation.mutate(value);
  };

  const handleDismissNotification = async () => {
    const dismissUrl = outlineIndexData?.notificationDismissUrl;
    if (dismissUrl) {
      try {
        await dismissNotificationMutation.mutateAsync(dismissUrl);
      } catch {
        // Error handled via mutation derived state
      }
    }
  };

  const reindexCourse = async () => {
    const link = outlineIndexData?.reindexLink;
    if (!link) { return; }
    try {
      await reindexMutation.mutateAsync(link);
    } catch {
      // Error handled via useCourseOutlineReindexStatus mutation state
    }
  };

  const headerNavigationsActions = {
    handleNewSection: async () => {
      // istanbul ignore next - back compat with plugin slot
      await handleAddBlock.mutateAsync({
        type: ContainerType.Chapter,
        parentLocator: courseUsageKey,
        displayName: COURSE_BLOCK_NAMES.chapter.name,
      });
    },
    handleReIndex: async () => {
      setDisableReindexButton(true);
      setShowSuccessAlert(false);
      try {
        await reindexCourse();
      } finally {
        setDisableReindexButton(false);
      }
    },
    handleExpandAll: () => {
      setSectionsExpanded((prevState) => !prevState);
    },
    lmsLink,
  };

  const handleOpenHighlightsModal = (section) => {
    setActionTargetSelection({
      currentId: section.id,
      sectionId: section.id,
    });
    openHighlightsModal();
  };

  const handleHighlightsFormSubmit = (highlights) => {
    if (!actionTargetSelection?.currentId) { return; }
    const dataToSend = Object.values(highlights).filter(Boolean);
    highlightsMutation.mutate({ sectionId: actionTargetSelection.currentId, highlights: dataToSend });
    closeHighlightsModal();
  };

  const handleConfigureModalClose = () => {
    closeConfigureModal();
    setActionTargetSelection(undefined);
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
    configureCurrentSelection(actionTargetSelection, variables);
    handleConfigureModalClose();
  };

  useEffect(() => {
    setShowSuccessAlert(reIndexLoadingStatus === RequestStatus.SUCCESSFUL);
  }, [reIndexLoadingStatus]);

  return {
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
    handleOpenHighlightsModal,
    isHighlightsModalOpen,
    closeHighlightsModal,
    courseName: courseStructure?.displayName,
    isDeleteModalOpen,
    closeDeleteModal,
    openDeleteModal,
    handleDeleteItemSubmit,

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
    errors,
    handleUnlinkItemSubmit,
  };
};

export { useCourseOutline };
