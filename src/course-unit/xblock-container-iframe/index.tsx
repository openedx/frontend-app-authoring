import {
  useRef, FC, useEffect, useState, useMemo, useCallback,
} from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { useToggle } from '@openedx/paragon';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import DeleteModal from '../../generic/delete-modal/DeleteModal';
import ConfigureModal from '../../generic/configure-modal/ConfigureModal';
import { IFRAME_FEATURE_POLICY } from '../../constants';
import { COMPONENT_TYPES_WITH_NEW_EDITOR } from '../constants';
import { fetchCourseUnitQuery } from '../data/thunk';
import { useIframe } from '../context/hooks';
import {
  useMessageHandlers,
  useIframeContent,
  useIframeMessages,
  useIFrameBehavior,
} from './hooks';
import { formatAccessManagedXBlockData, getIframeUrl } from './utils';
import messages from './messages';

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

  const iframeUrl = useMemo(() => getIframeUrl(blockId), [blockId]);

  const { setIframeRef, sendMessageToIframe } = useIframe();
  const { iframeHeight } = useIFrameBehavior({ id: blockId, iframeUrl });
  const { refreshIframeContent } = useIframeContent(iframeRef, setIframeRef, sendMessageToIframe);

  useEffect(() => {
    setIframeRef(iframeRef);
  }, [setIframeRef]);

  const handleDuplicateXBlock = useCallback(
    (blockType: string, usageId: string) => {
      unitXBlockActions.handleDuplicate(usageId);
      if (COMPONENT_TYPES_WITH_NEW_EDITOR[blockType]) {
        navigate(`/course/${courseId}/editor/${blockType}/${usageId}`);
      }
      refreshIframeContent();
    },
    [unitXBlockActions, courseId, navigate, refreshIframeContent],
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

  const handleRefetchXBlocks = useCallback(() => {
    setTimeout(() => dispatch(fetchCourseUnitQuery(blockId)), 1000);
  }, [dispatch, blockId]);

  const onDeleteSubmit = () => {
    if (deleteXBlockId) {
      unitXBlockActions.handleDelete(deleteXBlockId);
      closeDeleteModal();
      refreshIframeContent();
    }
  };

  const onManageXBlockAccessSubmit = (...args: any[]) => {
    if (configureXBlockId) {
      handleConfigureSubmit(configureXBlockId, ...args, closeConfigureModal);
      setAccessManagedXBlockData({});
      refreshIframeContent();
    }
  };

  const messageHandlers = useMessageHandlers({
    courseId,
    navigate,
    dispatch,
    setIframeOffset,
    handleDeleteXBlock,
    handleRefetchXBlocks,
    handleDuplicateXBlock,
    handleManageXBlockAccess,
  });

  useIframeMessages(messageHandlers);

  return (
    <>
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
    </>
  );
};

export default XBlockContainerIframe;
