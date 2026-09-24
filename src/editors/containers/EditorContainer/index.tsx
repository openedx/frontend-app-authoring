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
import { Close, CloseFullscreen, OpenInFull } from '@openedx/paragon/icons';
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

export const EditorModalWrapper: React.FC<WrapperProps & { onClose: () => void; fullscreen?: boolean; }> = (
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

export const EditorModalBody: React.FC<WrapperProps> = ({ children }) => (
  <ModalDialog.Body className="pb-0">{children}</ModalDialog.Body>
);

// eslint-disable-next-line react/jsx-no-useless-fragment
export const FooterWrapper: React.FC<WrapperProps> = ({ children }) => <>{children}</>;

interface Props extends EditorComponent {
  children: React.ReactNode;
  getContent: Function;
  isDirty: () => boolean;
  validateEntry?: Function | null;
  /**
   * Replaces this app's built-in save. Use it when the editor persists its own
   * content (an out-of-tree plugin saving through its block's handler, say),
   * because the built-in path only knows how to build payloads for the block
   * types in `supportedEditors` and throws for anything else. `validateEntry`
   * still runs first and a falsy result still blocks the save. May return a
   * promise: the unsaved-changes prompt stays armed until it resolves, and a
   * rejection shows the save-failed message. Until it settles, Save is
   * disabled and further clicks are ignored, the title cannot be edited, and
   * Cancel and close are refused: the request cannot be taken back.
   */
  onSave?: (() => void | Promise<unknown>) | null;
}

const EditorContainer: React.FC<Props> = ({
  children,
  getContent,
  isDirty,
  onClose = null,
  validateEntry = null,
  returnFunction = null,
  onSave: onSaveOverride = null,
}) => {
  const intl = useIntl();
  const dispatch = useDispatch();
  // Required to mark data as not dirty on save
  const [saved, setSaved] = React.useState(false);
  // Failure of an `onSave` override. The built-in path reports through the
  // redux request state (`saveFailed`); the override has no such state.
  const [overrideSaveFailed, setOverrideSaveFailed] = React.useState(false);
  // An `onSave` override that has been called and not yet settled. The ref is
  // the guard (a double-click lands both clicks before any re-render); the
  // state is its rendered counterpart.
  const overrideSavingRef = React.useRef(false);
  const [overrideSaving, setOverrideSaving] = React.useState(false);
  const setOverridePending = (pending: boolean) => {
    overrideSavingRef.current = pending;
    setOverrideSaving(pending);
  };
  const isInitialized = hooks.isInitialized();
  const { isCancelConfirmOpen, openCancelConfirmModal, closeCancelConfirmModal } = hooks.cancelConfirmModalToggle();
  const [isFullscreen, , , toggleFullscreen] = useToggle(false);
  const handleCancel = hooks.handleCancel({ onClose, returnFunction });
  const { createFailed, createFailedError } = hooks.createFailed();
  const disableSave = !isInitialized || overrideSaving;
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
    if (onSaveOverride) {
      // One save at a time. A second request would race the first: one of them
      // failing re-enables the editor while the other can still succeed and
      // close it.
      if (overrideSavingRef.current) {
        return;
      }
      // Same gate the built-in path applies (see editors/hooks.ts saveBlock).
      if (validateEntry && !validateEntry()) {
        return;
      }
      // Unlike the built-in path, not optimistic: the override may wait on
      // uploads before it sends anything, and leaving the page in that window
      // must still warn. An override that navigates away on success has to
      // report itself clean through `isDirty` before it does so.
      setOverrideSaveFailed(false);
      setOverridePending(true);
      let result: void | Promise<unknown>;
      try {
        result = onSaveOverride();
      } catch {
        setOverridePending(false);
        setOverrideSaveFailed(true);
        return;
      }
      Promise.resolve(result).then(
        () => {
          setOverridePending(false);
          setSaved(true);
        },
        () => {
          setOverridePending(false);
          setOverrideSaveFailed(true);
        },
      );
      return;
    }
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
    // The override's request is out and cannot be taken back. Cancelling now
    // would let the author discard an editor whose content is about to be
    // persisted; let the save settle first.
    if (overrideSavingRef.current) {
      return;
    }
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
      {(saveFailed || overrideSaveFailed) && (
        <Toast
          show
          onClose={() => {
            setOverrideSaveFailed(false);
            clearSaveFailed();
          }}
        >
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
              {
                /* The override reads the title once, when it sends. Locked from then
                  on, or a later edit would be dropped when the save lands. */
              }
              <TitleHeader isInitialized={isInitialized} isEditDisabled={overrideSaving} />
            </h2>
            <ActionRow.Spacer />
            <Stack direction="horizontal" reversed gap={1}>
              <IconButton
                src={Close}
                iconAs={Icon}
                onClick={confirmCancelIfDirty}
                alt={intl.formatMessage(messages.exitButtonAlt)}
                disabled={overrideSaving}
                autoFocus
              />
              <IconButton
                src={isFullscreen ? CloseFullscreen : OpenInFull}
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
              disabled={overrideSaving}
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
