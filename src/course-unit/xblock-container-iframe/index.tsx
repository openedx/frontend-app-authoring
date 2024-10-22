import {
  useRef, FC, useEffect, useState,
} from 'react';
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import { getConfig } from '@edx/frontend-platform';
import { useToggle } from '@openedx/paragon';

import DeleteModal from '../../generic/delete-modal/DeleteModal';
import ConfigureModal from '../../generic/configure-modal/ConfigureModal';
import { IFRAME_FEATURE_POLICY } from '../constants';
import { useIFrameBehavior } from './hooks';
import messages from './messages';
import { COURSE_BLOCK_NAMES } from '../../constants';

/**
 * This offset is necessary to fully display the dropdown actions of the XBlock
 * in case the XBlock does not have content inside.
 */
const IFRAME_BOTTOM_OFFSET = 220;

interface XBlockContainerIframeProps {
  blockId: string;
}

const XBlockContainerIframe: FC<XBlockContainerIframeProps> = ({
  blockId, unitXBlockActions, xblocks, handleConfigureSubmit,
}) => {
  const intl = useIntl();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [messageFromIframe, setMessageFromIframe] = useState('');
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [deleteXblockId, setDeleteXblockId] = useState(false);
  const [editXblockId, setEditXblockId] = useState(false);
  const [currentXblockData, setCurrentXblockData] = useState({});
  const [isConfigureModalOpen, openConfigureModal, closeConfigureModal] = useToggle(false);
  console.log('xblocks', xblocks);
  const iframeUrl = `${getConfig().STUDIO_BASE_URL}/container_embed/${blockId}`;

  useEffect(() => {
    const message = { type: 'react-app', text: 'Hello from React!' };
    if (iframeRef.current) {
      iframeRef.current.contentWindow.postMessage(message, '*');
    }

    const handleMessage = (event) => {
      console.log('IFRAME EVENT:', event.data);
      if (event.data && event.data.type === 'response') {
        setMessageFromIframe(event.data.text);
      }

      if (event.data && event.data.type === 'deleteXBlock') {
        setShowDeleteAlert(true);
        setDeleteXblockId(event.data.payload.id);
      }

      if (event.data && event.data.type === 'editXBlock') {
        openConfigureModal();
        setEditXblockId(event.data.payload.id);
        const foundBlock = xblocks?.find(block => block.blockId === event.data.payload.id);
        console.log('foundBlock', foundBlock);
        const currentItemData = {
          category: COURSE_BLOCK_NAMES.component.id,
          displayName: foundBlock?.name,
          userPartitionInfo: foundBlock?.userPartitionInfo,
          showCorrectness: 'always',
        };
        setCurrentXblockData(currentItemData);
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  const { iframeHeight } = useIFrameBehavior({
    id: blockId,
    iframeUrl,
  });

  const handleDeleteItemSubmit = () => {
    unitXBlockActions.handleDelete(deleteXblockId);
    setShowDeleteAlert(false);
    setTimeout(() => {
      const message = { type: 'refreshXBlock', text: 'Hello from React!' };
      if (iframeRef.current) {
        iframeRef.current.contentWindow.postMessage(message, '*');
      }
    }, 2000);
  };

  const onConfigureSubmit = (...arg) => {
    handleConfigureSubmit(editXblockId, ...arg, closeConfigureModal);
    setTimeout(() => {
      const message = { type: 'refreshXBlock', text: 'Hello from React!' };
      if (iframeRef.current) {
        iframeRef.current.contentWindow.postMessage(message, '*');
      }
    }, 2000);
  };

  return (
    <>
      <DeleteModal
        // category={deleteCategory}
        isOpen={showDeleteAlert}
        close={() => setShowDeleteAlert(false)}
        onDeleteSubmit={handleDeleteItemSubmit}
      />
      <ConfigureModal
        isXBlockComponent
        isOpen={isConfigureModalOpen}
        onClose={closeConfigureModal}
        onConfigureSubmit={onConfigureSubmit}
        currentItemData={currentXblockData}
      />
      <iframe
        id="my_course_unit_iframe"
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
      />
    </>
  );
};

XBlockContainerIframe.propTypes = {
  blockId: PropTypes.string.isRequired,
};

export default XBlockContainerIframe;
