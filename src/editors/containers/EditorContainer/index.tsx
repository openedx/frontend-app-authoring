import React from 'react';
import { useDispatch } from 'react-redux';

import {
  ActionRow,
  Button,
  Icon,
  IconButton,
  ModalDialog,
  Spinner,
  Toast,
} from '@openedx/paragon';
import { Close } from '@openedx/paragon/icons';
import { useIntl, FormattedMessage } from '@edx/frontend-platform/i18n';

import { EditorComponent } from '../../EditorComponent';
import { useEditorContext } from '../../EditorContext';
import BaseModal from '../../sharedComponents/BaseModal';
import TitleHeader from './components/TitleHeader';
import * as hooks from './hooks';
import messages from './messages';
import './index.scss';
import usePromptIfDirty from '../../../generic/promptIfDirty/usePromptIfDirty';

interface WrapperProps {
  children: React.ReactNode;
}

export const EditorModalWrapper: React.FC<WrapperProps & { onClose: () => void }> = ({ children, onClose }) => {
  const { fullScreen } = useEditorContext();
  const intl = useIntl();
  if (fullScreen) {
    return (
      <div
        className="editor-container d-flex flex-column position-relative zindex-0"
        style={{ minHeight: '100%' }}
      >
        {children}
      </div>
    );
  }
  const title = intl.formatMessage(messages.modalTitle);
  return (
    <ModalDialog isOpen size="xl" isOverflowVisible={false} onClose={onClose} title={title}>{children}</ModalDialog>
  );
};

export const EditorModalBody: React.FC<WrapperProps> = ({ children }) => {
  const { fullScreen } = useEditorContext();
  return <ModalDialog.Body className={fullScreen ? 'pb-6' : 'pb-0'}>{ children }</ModalDialog.Body>;
};

export const FooterWrapper: React.FC<WrapperProps> = ({ children }) => {
  const { fullScreen } = useEditorContext();
  if (fullScreen) {
    return <div className="editor-footer fixed-bottom">{children}</div>;
  }
  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <>{ children }</>;
};

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
  const handleCancel = hooks.handleCancel({ onClose, returnFunction });
  const disableSave = !isInitialized;
  const saveFailed = hooks.saveFailed();
  const clearSaveFailed = hooks.clearSaveError({ dispatch });
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
    <EditorModalWrapper onClose={confirmCancelIfDirty}>
      {saveFailed && (
        <Toast show onClose={clearSaveFailed}>
          <FormattedMessage {...messages.contentSaveFailed} />
        </Toast>
      )}
      <BaseModal
        size="md"
        confirmAction={(
          <Button
            variant="primary"
            onClick={() => {
              handleCancel();
              if (returnFunction) {
                closeCancelConfirmModal();
              }
            }}
          >
            <FormattedMessage {...messages.okButtonLabel} />
          </Button>
        )}
        isOpen={isCancelConfirmOpen}
        close={() => {
          closeCancelConfirmModal();
        }}
        title={intl.formatMessage(messages.cancelConfirmTitle)}
      >
        <FormattedMessage {...messages.cancelConfirmDescription} />
      </BaseModal>
      <ModalDialog.Header className="shadow-sm zindex-10">
        <div className="d-flex flex-row justify-content-between">
          <h2 className="h3 col pl-0">
            <TitleHeader isInitialized={isInitialized} />
          </h2>
          <IconButton
            src={Close}
            iconAs={Icon}
            onClick={confirmCancelIfDirty}
            alt={intl.formatMessage(messages.exitButtonAlt)}
          />
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
