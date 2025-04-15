import React, { useEffect } from 'react';
import { getConfig } from '@edx/frontend-platform';
import { useIntl } from '@edx/frontend-platform/i18n';
import { useToggle } from '@openedx/paragon';

import { LibraryBlock } from '../library-authoring/LibraryBlock';
import { EditorModalWrapper } from './containers/EditorContainer';
import { ToastContext } from '../generic/toast-context';

import messages from './messages';
import CancelConfirmModal from './containers/EditorContainer/components/CancelConfirmModal';
import { IframeProvider } from '../generic/hooks/context/iFrameContext';

interface AdvancedEditorProps {
  usageKey: string,
  onClose: (() => void) | null,
}

const AdvancedEditor = ({ usageKey, onClose }: AdvancedEditorProps) => {
  const intl = useIntl();
  const { showToast } = React.useContext(ToastContext);
  const [isCancelConfirmOpen, openCancelConfirmModal, closeCancelConfirmModal] = useToggle(false);

  useEffect(() => {
    const handleIframeMessage = (event) => {
      if (event.origin !== getConfig().STUDIO_BASE_URL) {
        return;
      }

      if (event.data.type === 'xblock-event') {
        const { eventName, data } = event.data;

        if (eventName === 'cancel') {
          openCancelConfirmModal();
        } else if (onClose && eventName === 'save' && data.state === 'end') {
          onClose();
        } else if (eventName === 'error') {
          showToast(intl.formatMessage(messages.advancedEditorGenericError));
        }
      }
    };

    window.addEventListener('message', handleIframeMessage);

    return () => {
      window.removeEventListener('message', handleIframeMessage);
    };
  }, []);

  return (
    <>
      <EditorModalWrapper onClose={openCancelConfirmModal}>
        <IframeProvider>
          <LibraryBlock
            usageKey={usageKey}
            view="studio_view"
            scrolling="yes"
            minHeight="70vh"
          />
        </IframeProvider>
      </EditorModalWrapper>
      <CancelConfirmModal
        isOpen={isCancelConfirmOpen}
        closeCancelConfirmModal={closeCancelConfirmModal}
        onCloseEditor={onClose}
      />
    </>
  );
};

export default AdvancedEditor;
