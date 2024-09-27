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
import BaseModal from '../../sharedComponents/BaseModal';
import TitleHeader from './components/TitleHeader';
import * as hooks from './hooks';
import messages from './messages';
import './index.scss';

interface WrapperProps {
  fullScreen: boolean;
  children: React.ReactNode;
}

const OuterWrapper: React.FC<WrapperProps> = ({ fullScreen, children }) => {
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
  return (
    <ModalDialog isOpen size="xl" isOverflowVisible={false}>{children}</ModalDialog>
  );
};

const FooterWrapper: React.FC<WrapperProps> = ({ fullScreen, children }) => {
  if (fullScreen) {
    return <div className="editor-footer fixed-bottom">{children}</div>;
  }
  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <>{ children }</>;
};

interface Props extends EditorComponent {
  children: React.ReactNode;
  getContent: Function;
  validateEntry?: Function | null;
  fullScreen: boolean;
}

const EditorContainer: React.FC<Props> = ({
  children,
  getContent,
  onClose = null,
  validateEntry = null,
  returnFunction = null,
  fullScreen = true,
}) => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const isInitialized = hooks.isInitialized();
  const { isCancelConfirmOpen, openCancelConfirmModal, closeCancelConfirmModal } = hooks.cancelConfirmModalToggle();
  const handleCancel = hooks.handleCancel({ onClose, returnFunction });
  const disableSave = !isInitialized;
  const saveFailed = hooks.saveFailed();
  const clearSaveFailed = hooks.clearSaveError({ dispatch });
  const onSave = hooks.handleSaveClicked({
    dispatch,
    getContent,
    validateEntry,
    returnFunction,
  });
  return (
    <OuterWrapper fullScreen={fullScreen}>
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
        close={closeCancelConfirmModal}
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
            onClick={openCancelConfirmModal}
            alt={intl.formatMessage(messages.exitButtonAlt)}
          />
        </div>
      </ModalDialog.Header>
      <ModalDialog.Body className={`pb-0 ${fullScreen ? 'mb-6' : ''}`}>
        {isInitialized && children}
      </ModalDialog.Body>
      <FooterWrapper fullScreen={fullScreen}>
        <ModalDialog.Footer className="shadow-sm">
          <ActionRow>
            <Button
              aria-label={intl.formatMessage(messages.cancelButtonAriaLabel)}
              variant="tertiary"
              onClick={openCancelConfirmModal}
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
    </OuterWrapper>
  );
};

export default EditorContainer;
