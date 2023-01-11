import React from 'react';
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';

import {
  Icon, ModalDialog, IconButton, Button,
} from '@edx/paragon';
import { Close } from '@edx/paragon/icons';

import { injectIntl, intlShape, FormattedMessage } from '@edx/frontend-platform/i18n';
import EditorFooter from './components/EditorFooter';
import TitleHeader from './components/TitleHeader';
import * as hooks from './hooks';
import BaseModal from '../TextEditor/components/BaseModal';
import messages from './messages';

export const EditorContainer = ({
  children,
  getContent,
  onClose,
  validateEntry,
  // injected
  intl,
}) => {
  const dispatch = useDispatch();
  const isInitialized = hooks.isInitialized();
  const { isCancelConfirmOpen, openCancelConfirmModal, closeCancelConfirmModal } = hooks.cancelConfirmModalToggle();
  const handleCancel = hooks.handleCancel({ onClose });
  return (
    <div
      className="position-relative zindex-0"
    >
      <BaseModal
        size="md"
        confirmAction={(
          <Button
            variant="primary"
            onClick={handleCancel}
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
        <ModalDialog.Title>
          <div
            style={{ height: '44px', margin: 'auto' }}
          >
            <TitleHeader isInitialized={isInitialized} />
          </div>
          <div className="pgn__modal-close-container">
            <IconButton
              src={Close}
              iconAs={Icon}
              onClick={openCancelConfirmModal}
            />
          </div>
        </ModalDialog.Title>
      </ModalDialog.Header>
      {isInitialized && children}
      <EditorFooter
        onCancel={openCancelConfirmModal}
        onSave={hooks.handleSaveClicked({ dispatch, getContent, validateEntry })}
        disableSave={!isInitialized}
        saveFailed={hooks.saveFailed()}
      />
    </div>
  );
};
EditorContainer.defaultProps = {
  onClose: null,
  validateEntry: null,
};
EditorContainer.propTypes = {
  children: PropTypes.node.isRequired,
  getContent: PropTypes.func.isRequired,
  onClose: PropTypes.func,
  validateEntry: PropTypes.func,
  // injected
  intl: intlShape.isRequired,
};

export default injectIntl(EditorContainer);
