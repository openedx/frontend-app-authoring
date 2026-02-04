import React from 'react';
import { useDispatch } from 'react-redux';

import {
  ActionRow,
  Button,
  Icon,
  IconButton,
  ModalDialog,
  Spinner,
  Stack,
  Toast,
  useToggle,
} from '@openedx/paragon';
import { Close, Fullscreen, FullscreenExit } from '@openedx/paragon/icons';
import { useIntl, FormattedMessage } from '@edx/frontend-platform/i18n';

import { parseErrorMsg } from '@src/library-authoring/add-content/AddContent';
import libraryMessages from '@src/library-authoring/add-content/messages';
import usePromptIfDirty from '@src/generic/promptIfDirty/usePromptIfDirty';

import { EditorComponent } from '../../EditorComponent';
import TitleHeader from './components/TitleHeader';
import * as hooks from './hooks';
import messages from './messages';

import './index.scss';
import CancelConfirmModal from './components/CancelConfirmModal';

interface WrapperProps {
  children: React.ReactNode;
}

export const EditorModalWrapper: React.FC<WrapperProps & { onClose: () => void, fullscreen?: boolean }> = (
  {
    children,
    onClose,
    fullscreen = false,
  },
) => {
  const intl = useIntl();

  const title = intl.formatMessage(messages.modalTitle);
  return (
    <ModalDialog
      isOpen
      onClose={onClose}
      title={title}
      size={fullscreen ? 'fullscreen' : 'xl'}
      isOverflowVisible={false}
      hasCloseButton={false}
    >
      {children}
    </ModalDialog>
  );
};

export const EditorModalBody: React.FC<WrapperProps> = ({ children }) => <ModalDialog.Body className="pb-0">{children}</ModalDialog.Body>;

// eslint-disable-next-line react/jsx-no-useless-fragment
export const FooterWrapper: React.FC<WrapperProps> = ({ children }) => <>{children}</>;

interface Props extends EditorComponent {
  children: React.ReactNode;
  getContent: Function;
  isDirty: () => boolean;
  validateEntry?: Function | null;
}

const EditorContainer: React.FC<Props> = ({
  children,
  getContent,
  isDirty,
  onClose = null,
  validateEntry = null,
  returnFunction = null,
}) => {
  const intl = useIntl();
  const dispatch = useDispatch();
  // Required to mark data as not dirty on save
  const [saved, setSaved] = React.useState(false);
  const isInitialized = hooks.isInitialized();
  const { isCancelConfirmOpen, openCancelConfirmModal, closeCancelConfirmModal } = hooks.cancelConfirmModalToggle();
  const [isFullscreen, , , toggleFullscreen] = useToggle(false);
  const handleCancel = hooks.handleCancel({ onClose, returnFunction });
  const { createFailed, createFailedError } = hooks.createFailed();
  const disableSave = !isInitialized;
  const saveFailed = hooks.saveFailed();
  const clearSaveFailed = hooks.clearSaveError({ dispatch });
  const clearCreateFailed = hooks.clearCreateError({ dispatch });

  const handleSave = hooks.handleSaveClicked({
    dispatch,
    getContent,
    validateEntry,
    returnFunction,
  });

  const onSave = () => {
    setSaved(true);
    handleSave();
  };
  // Stops user from navigating away if they have unsaved changes.
  usePromptIfDirty(() => {
    // Do not block if cancel modal is used or data is saved.
    if (isCancelConfirmOpen || saved) {
      return false;
    }
    return isDirty();
  });

  const confirmCancelIfDirty = () => {
    if (isDirty()) {
      openCancelConfirmModal();
    } else {
      handleCancel();
    }
  };

  return (
    <EditorModalWrapper onClose={confirmCancelIfDirty} fullscreen={isFullscreen}>
      {createFailed && (
        <Toast show onClose={clearCreateFailed}>
          {parseErrorMsg(
            intl,
            createFailedError,
            libraryMessages.errorCreateMessageWithDetail,
            libraryMessages.errorCreateMessage,
          )}
        </Toast>
      )}
      {saveFailed && (
        <Toast show onClose={clearSaveFailed}>
          {intl.formatMessage(messages.contentSaveFailed)}
        </Toast>
      )}
      <CancelConfirmModal
        isOpen={isCancelConfirmOpen}
        closeCancelConfirmModal={closeCancelConfirmModal}
        onCloseEditor={() => {
          handleCancel();
          if (returnFunction) {
            closeCancelConfirmModal();
          }
          dispatch({ type: 'resetEditor' });
        }}
      />
      <ModalDialog.Header className="shadow-sm zindex-10">
        <div className="d-flex flex-row justify-content-between">
          <ActionRow>
            <h2 className="h3 col pl-0">
              <TitleHeader isInitialized={isInitialized} />
            </h2>
            <ActionRow.Spacer />
            <Stack direction="horizontal" reversed>
              <IconButton
                src={Close}
                iconAs={Icon}
                onClick={confirmCancelIfDirty}
                alt={intl.formatMessage(messages.exitButtonAlt)}
                autoFocus
              />
              <IconButton
                src={isFullscreen ? FullscreenExit : Fullscreen}
                iconAs={Icon}
                alt={intl.formatMessage(messages.toggleFullscreenButtonLabel)}
                onClick={toggleFullscreen}
              />
            </Stack>
          </ActionRow>
        </div>
      </ModalDialog.Header>
      <EditorModalBody>
        {isInitialized && children}
      </EditorModalBody>
      <FooterWrapper>
        <ModalDialog.Footer className="shadow-sm">
          <ActionRow>
            <Button
              aria-label={intl.formatMessage(messages.cancelButtonAriaLabel)}
              variant="tertiary"
              onClick={confirmCancelIfDirty}
            >
              <FormattedMessage {...messages.cancelButtonLabel} />
            </Button>
            <Button
              aria-label={intl.formatMessage(messages.saveButtonAriaLabel)}
              onClick={onSave}
              disabled={disableSave}
            >
              {disableSave
                ? <Spinner animation="border" className="mr-3" />
                : <FormattedMessage {...messages.saveButtonLabel} />}
            </Button>
          </ActionRow>
        </ModalDialog.Footer>
      </FooterWrapper>
    </EditorModalWrapper>
  );
};

export default EditorContainer;
