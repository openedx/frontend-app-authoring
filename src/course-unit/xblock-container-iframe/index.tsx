import {
  useRef, FC, useEffect, useState, useMemo, useCallback,
} from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { useToggle, Sheet } from '@openedx/paragon';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import DeleteModal from '../../generic/delete-modal/DeleteModal';
import ConfigureModal from '../../generic/configure-modal/ConfigureModal';
import ModalIframe from '../../generic/modal-iframe';
import { IFRAME_FEATURE_POLICY } from '../../constants';
import ContentTagsDrawer from '../../content-tags-drawer/ContentTagsDrawer';
import supportedEditors from '../../editors/supportedEditors';
import { useIframe } from '../context/hooks';
import { updateCourseUnitSidebar } from '../data/thunk';
import {
  useMessageHandlers,
  useIframeContent,
  useIframeMessages,
  useIFrameBehavior,
} from './hooks';
import { formatAccessManagedXBlockData, getIframeUrl, getLegacyEditModalUrl } from './utils';
import messages from './messages';
import { messageTypes } from '../constants';

import {
  XBlockContainerIframeProps,
  AccessManagedXBlockDataTypes,
} from './types';

const XBlockContainerIframe: FC<XBlockContainerIframeProps> = ({
  courseId, blockId, unitXBlockActions, courseVerticalChildren, handleConfigureSubmit,
}) => {
  const intl = useIntl();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [isDeleteModalOpen, openDeleteModal, closeDeleteModal] = useToggle(false);
  const [isConfigureModalOpen, openConfigureModal, closeConfigureModal] = useToggle(false);
  const [accessManagedXBlockData, setAccessManagedXBlockData] = useState<AccessManagedXBlockDataTypes | {}>({});
  const [iframeOffset, setIframeOffset] = useState(0);
  const [deleteXBlockId, setDeleteXBlockId] = useState<string | null>(null);
  const [configureXBlockId, setConfigureXBlockId] = useState<string | null>(null);
  const [showLegacyEditModal, setShowLegacyEditModal] = useState<boolean>(false);
  const [isManageTagsOpen, openManageTagsModal, closeManageTagsModal] = useToggle(false);

  const iframeUrl = useMemo(() => getIframeUrl(blockId), [blockId]);
  const legacyEditModalUrl = useMemo(() => getLegacyEditModalUrl(configureXBlockId), [configureXBlockId]);

  const { setIframeRef, sendMessageToIframe } = useIframe();
  const { iframeHeight } = useIFrameBehavior({ id: blockId, iframeUrl });

  useIframeContent(iframeRef, setIframeRef);

  useEffect(() => {
    setIframeRef(iframeRef);
  }, [setIframeRef]);

  const handleDuplicateXBlock = useCallback(
    (blockType: string, usageId: string) => {
      unitXBlockActions.handleDuplicate(usageId);
      if (supportedEditors[blockType]) {
        navigate(`/course/${courseId}/editor/${blockType}/${usageId}`);
      }
    },
    [unitXBlockActions, courseId, navigate],
  );

  const handleDeleteXBlock = (usageId: string) => {
    setDeleteXBlockId(usageId);
    openDeleteModal();
  };

  const handleManageXBlockAccess = (usageId: string) => {
    openConfigureModal();
    setConfigureXBlockId(usageId);
    const foundXBlock = courseVerticalChildren?.find(xblock => xblock.blockId === usageId);
    if (foundXBlock) {
      setAccessManagedXBlockData(formatAccessManagedXBlockData(foundXBlock, usageId));
    }
  };

  const onDeleteSubmit = () => {
    if (deleteXBlockId) {
      unitXBlockActions.handleDelete(deleteXBlockId);
      closeDeleteModal();
    }
  };

  const onManageXBlockAccessSubmit = (...args: any[]) => {
    if (configureXBlockId) {
      handleConfigureSubmit(configureXBlockId, ...args, closeConfigureModal);
      setAccessManagedXBlockData({});
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
  };

  const handleFinishXBlockDragging = () => {
    dispatch(updateCourseUnitSidebar(blockId));
  };

  const handleOpenManageTagsModal = (id: string) => {
    setConfigureXBlockId(id);
    openManageTagsModal();
  };

  const messageHandlers = useMessageHandlers({
    courseId,
    navigate,
    dispatch,
    setIframeOffset,
    handleDeleteXBlock,
    handleDuplicateXBlock,
    handleManageXBlockAccess,
    handleScrollToXBlock,
    handleShowLegacyEditXBlockModal,
    handleCloseLegacyEditorXBlockModal,
    handleSaveEditedXBlockData,
    handleFinishXBlockDragging,
    handleOpenManageTagsModal,
  });

  useIframeMessages(messageHandlers);

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
      {Object.keys(accessManagedXBlockData).length ? (
        <ConfigureModal
          isXBlockComponent
          isOpen={isConfigureModalOpen}
          onClose={() => {
            closeConfigureModal();
            setAccessManagedXBlockData({});
          }}
          onConfigureSubmit={onManageXBlockAccessSubmit}
          currentItemData={accessManagedXBlockData as AccessManagedXBlockDataTypes}
          isSelfPaced={false}
        />
      ) : null}
      <iframe
        ref={iframeRef}
        title={intl.formatMessage(messages.xblockIframeTitle)}
        name="xblock-iframe"
        src={iframeUrl}
        frameBorder="0"
        allow={IFRAME_FEATURE_POLICY}
        allowFullScreen
        loading="lazy"
        style={{ width: '100%', height: iframeHeight + iframeOffset }}
        scrolling="no"
        referrerPolicy="origin"
        aria-label={intl.formatMessage(messages.xblockIframeLabel, { xblockCount: courseVerticalChildren.length })}
      />
      {configureXBlockId && (
        <Sheet
          position="right"
          show={isManageTagsOpen}
          onClose={closeManageTagsModal}
          blocking
        >
          <ContentTagsDrawer id={configureXBlockId} onClose={closeManageTagsModal} />
        </Sheet>
      )}
    </>
  );
};

export default XBlockContainerIframe;
