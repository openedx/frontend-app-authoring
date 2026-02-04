import React, { useEffect } from 'react';
import { getConfig } from '@edx/frontend-platform';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  ActionRow,
  Icon,
  IconButton,
  ModalDialog,
  ModalCloseButton,
  Stack,
  useToggle,
} from '@openedx/paragon';
import { Close, Fullscreen, FullscreenExit } from '@openedx/paragon/icons';

import { LibraryBlock } from '../library-authoring/LibraryBlock';
import { EditorModalWrapper } from './containers/EditorContainer';
import { ToastContext } from '../generic/toast-context';

import messages from './messages';
import CancelConfirmModal from './containers/EditorContainer/components/CancelConfirmModal';
import { IframeProvider } from '../generic/hooks/context/iFrameContext';

import editorModalWrapperMessages from './containers/EditorContainer/messages';

interface AdvancedEditorProps {
  usageKey: string,
  onClose: (() => void) | null,
}

const AdvancedEditor = ({ usageKey, onClose }: AdvancedEditorProps) => {
  const intl = useIntl();
  const { showToast } = React.useContext(ToastContext);
  const [isCancelConfirmOpen, openCancelConfirmModal, closeCancelConfirmModal] = useToggle(false);
  const [isFullscreen, , , toggleFullscreen] = useToggle(false);

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
      <EditorModalWrapper onClose={openCancelConfirmModal} fullscreen={isFullscreen}>
        <ModalDialog.Header>
          <ActionRow>
            <ModalDialog.Title>
              {intl.formatMessage(editorModalWrapperMessages.modalTitle)}
            </ModalDialog.Title>
            <ActionRow.Spacer />
            <Stack direction="horizontal" reversed>
              <ModalCloseButton
                as={IconButton}
                src={Close}
                iconAs={Icon}
              />
              <IconButton
                src={isFullscreen ? FullscreenExit : Fullscreen}
                iconAs={Icon}
                alt={intl.formatMessage(messages.advancedEditorFullscreenButtonAlt)}
                onClick={toggleFullscreen}
              />
            </Stack>
          </ActionRow>
        </ModalDialog.Header>
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
