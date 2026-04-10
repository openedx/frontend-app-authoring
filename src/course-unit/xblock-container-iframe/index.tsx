import { useQueryClient } from '@tanstack/react-query';
import { getConfig } from '@edx/frontend-platform';
import {
  FC,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { useToggle, StandardModal } from '@openedx/paragon';
import { useDispatch } from 'react-redux';

import { useToastContext } from '@src/generic/toast-context';
import DeleteModal from '@src/generic/delete-modal/DeleteModal';
import ConfigureModal from '@src/generic/configure-modal/ConfigureModal';
import ModalIframe from '@src/generic/modal-iframe';
import { useWaffleFlags } from '@src/data/apiHooks';
import { IFRAME_FEATURE_POLICY } from '@src/constants';
import { useIframe } from '@src/generic/hooks/context/hooks';
import { useIframeBehavior } from '@src/generic/hooks/useIframeBehavior';
import { useIframeContent } from '@src/generic/hooks/useIframeContent';
import { useIframeMessages } from '@src/generic/hooks/useIframeMessages';
import { UnlinkModal } from '@src/generic/unlink-modal';
import VideoSelectorPage from '@src/editors/VideoSelectorPage';
import EditorPage from '@src/editors/EditorPage';

import { useCourseAuthoringContext } from '@src/CourseAuthoringContext';
import { ConfigureUnitData } from '@src/course-outline/data/types';
import { AccessManagedXBlockDataTypes } from '@src/data/types';
import { useConfigureUnitWithPageUpdates } from '@src/course-unit/data/apiHooks';
import { messageTypes, PUBLISH_TYPES } from '../constants';
import {
  fetchCourseSectionVerticalData,
  fetchCourseVerticalChildrenData,
  updateCourseUnitSidebar,
} from '../data/thunk';
import {
  useMessageHandlers,
} from './hooks';
import messages from './messages';
import {
  XBlockContainerIframeProps,
} from './types';
import { formatAccessManagedXBlockData, getIframeUrl, getLegacyEditModalUrl } from './utils';
import { useUnitSidebarContext } from '../unit-sidebar/UnitSidebarContext';
import { courseOutlineQueryKeys } from '@src/course-outline/data/apiHooks';
import { contentTagsQueryKeys } from '@src/content-tags-drawer/data/apiHooks';

const XBlockContainerIframe: FC<XBlockContainerIframeProps> = ({
  courseId,
  blockId,
  unitXBlockActions,
  courseVerticalChildren,
  isUnitVerticalType,
  readonly,
}) => {
  const intl = useIntl();
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const {
    setCurrentPageKey,
    setSelectedComponentId,
  } = useUnitSidebarContext(!readonly) || {};

  const {
    showToast,
    closeToast,
  } = useToastContext();

  // Useful to reload iframe
  const [iframeKey, setIframeKey] = useState(0);
  const [isDeleteModalOpen, openDeleteModal, closeDeleteModal] = useToggle(false);
  const { isUnlinkModalOpen, openUnlinkModal, closeUnlinkModal } = useCourseAuthoringContext();
  const [isConfigureModalOpen, openConfigureModal, closeConfigureModal] = useToggle(false);
  const [isVideoSelectorModalOpen, showVideoSelectorModal, closeVideoSelectorModal] = useToggle();
  const [isXBlockEditorModalOpen, showXBlockEditorModal, closeXBlockEditorModal] = useToggle();
  const [blockType, setBlockType] = useState<string>('');
  const { useVideoGalleryFlow } = useWaffleFlags(courseId);
  const [newBlockId, setNewBlockId] = useState<string>('');
  const [
    accessManagedXBlockData,
    setAccessManagedXBlockData,
  ] = useState<AccessManagedXBlockDataTypes | undefined>(undefined);
  const [iframeOffset, setIframeOffset] = useState(0);
  const [deleteXBlockId, setDeleteXBlockId] = useState<string | null>(null);
  const [unlinkXBlockId, setUnlinkXBlockId] = useState<string | null>(null);
  const [configureXBlockId, setConfigureXBlockId] = useState<string | null>(null);
  const [showLegacyEditModal, setShowLegacyEditModal] = useState<boolean>(false);

  const iframeUrl = useMemo(() => getIframeUrl(blockId), [blockId]);
  const legacyEditModalUrl = useMemo(() => getLegacyEditModalUrl(configureXBlockId), [configureXBlockId]);

  const { iframeRef, setIframeRef, sendMessageToIframe } = useIframe();
  const { iframeHeight } = useIframeBehavior({ id: blockId, iframeUrl, iframeRef });

  useIframeContent(iframeRef, setIframeRef);

  useEffect(() => {
    setIframeRef(iframeRef);
  }, [setIframeRef]);

  const refreshComponent = (id: string) => {
    queryClient.invalidateQueries({
      queryKey: courseOutlineQueryKeys.courseItemId(id),
    });
    queryClient.invalidateQueries({
      queryKey: contentTagsQueryKeys.contentData(id),
    });
  };

  const onXBlockSave = useCallback(/* istanbul ignore next */ () => {
    closeXBlockEditorModal();
    closeVideoSelectorModal();
    sendMessageToIframe(messageTypes.refreshXBlock, null);
    refreshComponent(newBlockId);
  }, [closeXBlockEditorModal, closeVideoSelectorModal, sendMessageToIframe, newBlockId]);

  const handleEditXBlock = useCallback((type: string, id: string) => {
    setBlockType(type);
    setNewBlockId(id);
    if (type === 'video' && useVideoGalleryFlow) {
      showVideoSelectorModal();
    } else {
      showXBlockEditorModal();
    }
  }, [showVideoSelectorModal, showXBlockEditorModal]);

  const handleDuplicateXBlock = useCallback(
    (usageId: string) => {
      unitXBlockActions.handleDuplicate(usageId);
    },
    [unitXBlockActions, courseId],
  );

  const handleDeleteXBlock = (usageId: string) => {
    setDeleteXBlockId(usageId);
    openDeleteModal();
  };

  const handleUnlinkXBlock = (usageId: string) => {
    setUnlinkXBlockId(usageId);
    openUnlinkModal({});
  };

  const handleManageXBlockAccess = (usageId: string) => {
    openConfigureModal();
    setConfigureXBlockId(usageId);
    const foundXBlock = courseVerticalChildren?.find(xblock => xblock.blockId === usageId);
    if (foundXBlock) {
      setAccessManagedXBlockData(formatAccessManagedXBlockData(foundXBlock, usageId));
    }
  };

  const onDeleteSubmit = async () => {
    if (deleteXBlockId) {
      await unitXBlockActions.handleDelete(deleteXBlockId);
      setSelectedComponentId?.(undefined);
      closeDeleteModal();
    }
  };

  const onUnlinkSubmit = async () => {
    if (unlinkXBlockId) {
      await unitXBlockActions.handleUnlink(unlinkXBlockId);
      closeUnlinkModal();
      refreshComponent(unlinkXBlockId);
    }
  };

  const configureFn = useConfigureUnitWithPageUpdates();
  const onManageXBlockAccessSubmit = (variables: Omit<ConfigureUnitData, 'unitId'>) => {
    if (configureXBlockId) {
      configureFn.mutate({
        unitId: configureXBlockId,
        ...variables,
        type: PUBLISH_TYPES.republish,
      }, {
        onSuccess: () => sendMessageToIframe(messageTypes.completeManageXBlockAccess, { locator: configureXBlockId }),
        onSettled: () => closeConfigureModal(),
      });
      setAccessManagedXBlockData(undefined);
    }
  };

  const handleScrollToXBlock = (scrollOffset: number) => {
    window.scrollBy({
      top: scrollOffset,
      behavior: 'smooth',
    });
  };

  const handleShowLegacyEditXBlockModal = (id: string) => {
    setConfigureXBlockId(id);
    setShowLegacyEditModal(true);
  };

  const handleCloseLegacyEditorXBlockModal = () => {
    setConfigureXBlockId(null);
    setShowLegacyEditModal(false);
  };

  const handleSaveEditedXBlockData = () => {
    sendMessageToIframe(messageTypes.completeXBlockEditing, { locator: configureXBlockId });
    dispatch(updateCourseUnitSidebar(blockId));
    if (configureXBlockId) {
      refreshComponent(configureXBlockId);
    }
    if (!isUnitVerticalType) {
      dispatch(fetchCourseSectionVerticalData(blockId));
    }
  };

  const handleFinishXBlockDragging = () => {
    dispatch(updateCourseUnitSidebar(blockId));
  };

  const handleOpenManageTagsModal = (id: string) => {
    setCurrentPageKey?.('align', id);
    sendMessageToIframe(messageTypes.selectXblock, { locator: id });
  };

  const handleShowProcessingNotification = (variant: string) => {
    if (variant) {
      showToast(variant);
    }
  };

  const handleHideProcessingNotification = () => {
    dispatch(fetchCourseVerticalChildrenData(blockId, true, true));
    closeToast();
  };

  const handleRefreshIframe = () => {
    // Updating iframeKey forces the iframe to re-render.
    /* istanbul ignore next */
    setIframeKey((prev) => prev + 1);
  };

  const handleXBlockSelected = (id) => {
    setCurrentPageKey?.('info', id);
  };

  const messageHandlers = useMessageHandlers({
    courseId,
    dispatch,
    setIframeOffset,
    handleDeleteXBlock,
    handleUnlinkXBlock,
    handleDuplicateXBlock,
    handleManageXBlockAccess,
    handleScrollToXBlock,
    handleShowLegacyEditXBlockModal,
    handleCloseLegacyEditorXBlockModal,
    handleSaveEditedXBlockData,
    handleFinishXBlockDragging,
    handleOpenManageTagsModal,
    handleShowProcessingNotification,
    handleHideProcessingNotification,
    handleEditXBlock,
    handleRefreshIframe,
    handleXBlockSelected,
  });

  useIframeMessages(readonly ? {} : messageHandlers);

  return (
    <>
      {showLegacyEditModal && (
        <ModalIframe
          title={intl.formatMessage(messages.legacyEditModalIframeTitle)}
          src={legacyEditModalUrl}
        />
      )}
      <DeleteModal
        category="component"
        isOpen={isDeleteModalOpen}
        close={closeDeleteModal}
        onDeleteSubmit={onDeleteSubmit}
      />
      <UnlinkModal
        category="component"
        isOpen={isUnlinkModalOpen}
        close={closeUnlinkModal}
        onUnlinkSubmit={onUnlinkSubmit}
      />
      <StandardModal
        title={intl.formatMessage(messages.videoPickerModalTitle)}
        isOpen={isVideoSelectorModalOpen}
        onClose={closeVideoSelectorModal}
        isOverflowVisible={false}
        size="xl"
      >
        <div className="selector-page">
          <VideoSelectorPage
            blockId={newBlockId}
            courseId={courseId}
            studioEndpointUrl={getConfig().STUDIO_BASE_URL}
            lmsEndpointUrl={getConfig().LMS_BASE_URL}
            onCancel={closeVideoSelectorModal}
            returnFunction={/* istanbul ignore next */ () => onXBlockSave}
          />
        </div>
      </StandardModal>
      {isXBlockEditorModalOpen && (
        <div className="editor-page">
          <EditorPage
            courseId={courseId}
            blockType={blockType}
            blockId={newBlockId}
            studioEndpointUrl={getConfig().STUDIO_BASE_URL}
            lmsEndpointUrl={getConfig().LMS_BASE_URL}
            onClose={closeXBlockEditorModal}
            returnFunction={/* istanbul ignore next */ () => onXBlockSave}
          />
        </div>
      )}
      <ConfigureModal
        isXBlockComponent
        isOpen={isConfigureModalOpen}
        onClose={() => {
          closeConfigureModal();
          setAccessManagedXBlockData(undefined);
        }}
        onConfigureSubmit={onManageXBlockAccessSubmit}
        currentItemData={accessManagedXBlockData}
        isSelfPaced={false}
      />
      <iframe
        key={iframeKey}
        ref={iframeRef}
        title={intl.formatMessage(messages.xblockIframeTitle)}
        name="xblock-iframe"
        src={iframeUrl}
        frameBorder="0"
        allow={IFRAME_FEATURE_POLICY}
        allowFullScreen
        loading="lazy"
        style={{ height: iframeHeight + iframeOffset }}
        scrolling="no"
        referrerPolicy="origin"
        className="xblock-container-iframe"
        aria-label={intl.formatMessage(messages.xblockIframeLabel, { xblockCount: courseVerticalChildren.length })}
      />
    </>
  );
};

export default XBlockContainerIframe;
