import {
  useRef, FC, useEffect, useState,
} from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { getConfig } from '@edx/frontend-platform';
import { useToggle } from '@openedx/paragon';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import {
  hideProcessingNotification,
  showProcessingNotification,
} from '../../generic/processing-notification/data/slice';
import DeleteModal from '../../generic/delete-modal/DeleteModal';
import ConfigureModal from '../../generic/configure-modal/ConfigureModal';
import ModalIframe from '../../generic/modal-iframe/ModalIframe';
import { copyToClipboard } from '../../generic/data/thunks';
import { COURSE_BLOCK_NAMES } from '../../constants';
import { IFRAME_FEATURE_POLICY, messageTypes } from '../constants';
import { useIframe } from '../context/hooks';
import { useIFrameBehavior } from './hooks';
import messages from './messages';
import { getNotificationMessage } from '../data/utils';

const IFRAME_BOTTOM_OFFSET = 220;

interface XBlockContainerIframeProps {
  courseId: string;
  blockId: string;
  unitXBlockActions: {
    handleDelete: (XBlockId: string) => void;
    handleDuplicate: (XBlockId: string) => void;
  };
  xblocks: Array<{
    name: string;
    blockId: string;
    blockType: string;
    userPartitionInfo: {
      selectablePartitions: any[];
      selectedPartitionIndex: number;
      selectedGroupsLabel: string;
    };
    userPartitions: Array<{
      id: number;
      name: string;
      scheme: string;
      groups: Array<{
        id: number;
        name: string;
        selected: boolean;
        deleted: boolean;
      }>;
    }>;
    upstreamLink: string | null;
    actions: {
      canCopy: boolean;
      canDuplicate: boolean;
      canMove: boolean;
      canManageAccess: boolean;
      canDelete: boolean;
      canManageTags: boolean;
    };
    validationMessages: any[];
    renderError: string;
    id: string;
  }>;
  handleConfigureSubmit: (XBlockId: string, ...args: any[]) => void;
}

const XBlockContainerIframe: FC<XBlockContainerIframeProps> = ({
  courseId, blockId, unitXBlockActions, xblocks, handleConfigureSubmit,
}) => {
  const intl = useIntl();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [deleteXblockId, setDeleteXblockId] = useState<string | null>(null);
  const [isDeleteModalOpen, openDeleteModal, closeDeleteModal] = useToggle(false);
  const [isConfigureModalOpen, openConfigureModal, closeConfigureModal] = useToggle(false);
  const { setIframeRef, sendMessageToIframe } = useIframe();
  const [editXblockId, setEditXblockId] = useState<string | null>(null);
  const [currentXblockData, setCurrentXblockData] = useState<any>({});
  const [showLegacyEditModal, setShowLegacyEditModal] = useState(false);

  const iframeUrl = `${getConfig().STUDIO_BASE_URL}/container_embed/${blockId}`;
  const editXblockModalUrl = `${getConfig().STUDIO_BASE_URL}/xblock/${editXblockId}/action/edit`;

  useEffect(() => {
    setIframeRef(iframeRef);
  }, [setIframeRef]);

  const handleDelete = (id: string) => {
    openDeleteModal();
    setDeleteXblockId(id);
  };

  const handleConfigure = (id: string) => {
    openConfigureModal();
    setEditXblockId(id);

    const foundXblockInfo = xblocks?.find(block => block.blockId === id);

    if (foundXblockInfo) {
      const { name, userPartitionInfo } = foundXblockInfo;

      setCurrentXblockData({
        category: COURSE_BLOCK_NAMES.component.id,
        displayName: name,
        userPartitionInfo,
        showCorrectness: 'always',
      });
    }
  };

  const handleCopy = (id: string) => {
    dispatch(copyToClipboard(id));
  };

  const handleRefreshXblocks = () => {
    const notification = getNotificationMessage('republish', false, true);
    dispatch(showProcessingNotification(notification));
    // TODO: this artificial delay is a temporary solution
    // to ensure the iframe content is properly refreshed.
    setTimeout(() => {
      sendMessageToIframe(messageTypes.refreshXBlock, null);
      dispatch(hideProcessingNotification());
    }, 1000);
  };

  const handleDuplicateXBlock = (id) => {
    if (id) {
      unitXBlockActions.handleDuplicate(id);
      handleRefreshXblocks();
    }
  };

  const navigateToNewXBlockEditor = (url: string) => {
    navigate(`/course/${courseId}/editor${url}`);
  };

  const handleShowEditXBlockModal = (id: string) => {
    setEditXblockId(id);
    setShowLegacyEditModal(true);
  };

  const handleCloseEditorXBlockModal = () => {
    setEditXblockId(null);
    setShowLegacyEditModal(false);
  };

  useEffect(() => {
    const messageHandlers: Record<string, (payload) => void> = {
      [messageTypes.deleteXBlock]: (payload) => handleDelete(payload.id),
      [messageTypes.manageXBlockAccess]: (payload) => handleConfigure(payload.id),
      [messageTypes.copyXBlock]: (payload) => handleCopy(payload.id),
      [messageTypes.duplicateXBlock]: (payload) => handleDuplicateXBlock(payload.id),
      [messageTypes.newXBlockEditor]: (payload) => navigateToNewXBlockEditor(payload.url),
      [messageTypes.editXBlock]: (payload) => handleShowEditXBlockModal(payload.id),
      [messageTypes.closeXBlockEditorModal]: () => handleCloseEditorXBlockModal(),
      [messageTypes.saveEditedXBlockData]: handleRefreshXblocks,
    };

    const handleMessage = (event: MessageEvent) => {
      const { type, payload } = event.data || {};

      if (type && messageHandlers[type]) {
        messageHandlers[type](payload);
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [dispatch, blockId, xblocks]);

  const { iframeHeight } = useIFrameBehavior({
    id: blockId,
    iframeUrl,
  });

  const handleDeleteItemSubmit = () => {
    if (deleteXblockId) {
      unitXBlockActions.handleDelete(deleteXblockId);
      closeDeleteModal();
      handleRefreshXblocks();
    }
  };

  const onConfigureSubmit = (...args: any[]) => {
    if (editXblockId) {
      handleConfigureSubmit(editXblockId, ...args, closeConfigureModal);
      handleRefreshXblocks();
    }
  };

  return (
    <>
      {showLegacyEditModal && (
        <ModalIframe
          title="Xblock Edit Modal"
          src={editXblockModalUrl}
        />
      )}
      <DeleteModal
        category="component"
        isOpen={isDeleteModalOpen}
        close={closeDeleteModal}
        onDeleteSubmit={handleDeleteItemSubmit}
      />
      <ConfigureModal
        isXBlockComponent
        isOpen={isConfigureModalOpen}
        onClose={closeConfigureModal}
        onConfigureSubmit={onConfigureSubmit}
        currentItemData={currentXblockData}
        isSelfPaced={false}
      />
      <iframe
        ref={iframeRef}
        title={intl.formatMessage(messages.xblockIframeTitle)}
        src={iframeUrl}
        frameBorder="0"
        allow={IFRAME_FEATURE_POLICY}
        allowFullScreen
        loading="lazy"
        style={{ width: '100%', height: iframeHeight + IFRAME_BOTTOM_OFFSET }}
        scrolling="no"
        referrerPolicy="origin"
        aria-label={intl.formatMessage(messages.xblockIframeLabel, { xblockCount: xblocks.length })}
      />
    </>
  );
};

export default XBlockContainerIframe;
