import {
  useRef, FC, useEffect, useState, useMemo, useCallback,
} from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { getConfig } from '@edx/frontend-platform';
import { useToggle } from '@openedx/paragon';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import DeleteModal from '../../generic/delete-modal/DeleteModal';
import ConfigureModal from '../../generic/configure-modal/ConfigureModal';
import { copyToClipboard } from '../../generic/data/thunks';
import { COURSE_BLOCK_NAMES, IFRAME_FEATURE_POLICY } from '../../constants';
import { messageTypes, COMPONENT_TYPES } from '../constants';
import { fetchCourseUnitQuery } from '../data/thunk';
import { useIframe } from '../context/hooks';
import { useIFrameBehavior } from './hooks';
import messages from './messages';

import {
  XBlockContainerIframeProps,
  XBlockDataTypes,
  MessagePayloadTypes,
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
  const { setIframeRef, sendMessageToIframe } = useIframe();
  const [currentXBlockId, setCurrentXBlockId] = useState<string | null>(null);
  const [currentXBlockData, setCurrentXBlockData] = useState<any>({});
  const [courseXBlockIframeOffset, setCourseXBlockIframeOffset] = useState<number>(0);

  const iframeUrl = useMemo(() => `${getConfig().STUDIO_BASE_URL}/container_embed/${blockId}`, [blockId]);

  useEffect(() => {
    setIframeRef(iframeRef);
  }, [setIframeRef]);

  useEffect(() => {
    if (currentXBlockId) {
      const foundXBlockInfo = courseVerticalChildren?.find(xblock => xblock.blockId === currentXBlockId);
      if (foundXBlockInfo) {
        const { name, userPartitionInfo, blockType } = foundXBlockInfo;

        setCurrentXBlockData({
          category: COURSE_BLOCK_NAMES.component.id,
          displayName: name,
          userPartitionInfo,
          showCorrectness: 'always',
          blockType,
          id: currentXBlockId,
        });
      }
    }
  }, [isConfigureModalOpen, currentXBlockId, courseVerticalChildren]);

  const handleRefreshIframe = useCallback(() => {
    // TODO: this artificial delay is a temporary solution
    // to ensure the iframe content is properly refreshed.
    setTimeout(() => {
      sendMessageToIframe(messageTypes.refreshXBlock, null);
    }, 1000);
  }, [sendMessageToIframe]);

  const handleDuplicateXBlock = useCallback(
    (xblockData: XBlockDataTypes) => {
      const duplicateAndNavigate = (blockType: string) => {
        unitXBlockActions.handleDuplicate(xblockData.id);
        if ([COMPONENT_TYPES.html, COMPONENT_TYPES.problem, COMPONENT_TYPES.video].includes(blockType)) {
          navigate(`/course/${courseId}/editor/${blockType}/${xblockData.id}`);
        }
        handleRefreshIframe();
      };

      duplicateAndNavigate(xblockData.blockType);
    },
    [unitXBlockActions, courseId, navigate, handleRefreshIframe],
  );

  const handleRefetchXBlocks = useCallback(() => {
    // TODO: this artificial delay is a temporary solution
    // to ensure the iframe content is properly refreshed.
    setTimeout(() => {
      dispatch(fetchCourseUnitQuery(blockId));
    }, 1000);
  }, [dispatch, blockId]);

  useEffect(() => {
    const messageHandlers: Record<string, (payload: MessagePayloadTypes) => void> = {
      [messageTypes.deleteXBlock]: openDeleteModal,
      [messageTypes.manageXBlockAccess]: () => openConfigureModal(),
      [messageTypes.copyXBlock]: () => dispatch(copyToClipboard(currentXBlockId)),
      [messageTypes.duplicateXBlock]: () => handleDuplicateXBlock(currentXBlockData),
      [messageTypes.refreshPositions]: handleRefetchXBlocks,
      [messageTypes.newXBlockEditor]: ({ url }) => navigate(`/course/${courseId}/editor${url}`),
      [messageTypes.currentXBlockId]: ({ id }) => setCurrentXBlockId(id),
      [messageTypes.toggleCourseXBlockDropdown]: ({
        courseXBlockDropdownHeight,
      }) => setCourseXBlockIframeOffset(courseXBlockDropdownHeight),
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
  }, [dispatch, blockId, courseVerticalChildren, currentXBlockId, currentXBlockData]);

  const { iframeHeight } = useIFrameBehavior({
    id: blockId,
    iframeUrl,
  });

  const handleDeleteItemSubmit = () => {
    if (currentXBlockId) {
      unitXBlockActions.handleDelete(currentXBlockId);
      closeDeleteModal();
      handleRefreshIframe();
    }
  };

  const onConfigureSubmit = (...args: any[]) => {
    if (currentXBlockId) {
      handleConfigureSubmit(currentXBlockId, ...args, closeConfigureModal);
      handleRefreshIframe();
    }
  };

  return (
    <>
      <DeleteModal
        category="component"
        isOpen={isDeleteModalOpen}
        close={closeDeleteModal}
        onDeleteSubmit={handleDeleteItemSubmit}
      />
      {currentXBlockId && (
        <ConfigureModal
          isXBlockComponent
          isOpen={isConfigureModalOpen}
          onClose={closeConfigureModal}
          onConfigureSubmit={onConfigureSubmit}
          currentItemData={currentXBlockData}
          isSelfPaced={false}
        />
      )}
      <iframe
        ref={iframeRef}
        title={intl.formatMessage(messages.xblockIframeTitle)}
        src={iframeUrl}
        frameBorder="0"
        allow={IFRAME_FEATURE_POLICY}
        allowFullScreen
        loading="lazy"
        style={{
          width: '100%',
          height: iframeHeight + courseXBlockIframeOffset,
        }}
        scrolling="no"
        referrerPolicy="origin"
        aria-label={intl.formatMessage(messages.xblockIframeLabel, { xblockCount: courseVerticalChildren.length })}
      />
    </>
  );
};

export default XBlockContainerIframe;
