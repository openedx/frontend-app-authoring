import React from 'react';
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';

import {
  Icon, ModalDialog, IconButton, Button,
} from '@edx/paragon';
import { Close } from '@edx/paragon/icons';
import { injectIntl, intlShape, FormattedMessage } from '@edx/frontend-platform/i18n';

import BaseModal from '../../sharedComponents/BaseModal';
import EditorFooter from './components/EditorFooter';
import TitleHeader from './components/TitleHeader';
import * as hooks from './hooks';
import messages from './messages';

export const EditorContainer = ({
  children,
  getContent,
  onClose,
  validateEntry,
  returnFunction,
  // injected
  intl,
}) => {
  const dispatch = useDispatch();
  const isInitialized = hooks.isInitialized();
  const { isCancelConfirmOpen, openCancelConfirmModal, closeCancelConfirmModal } = hooks.cancelConfirmModalToggle();
  const handleCancel = hooks.handleCancel({ onClose, returnFunction });
  return (
    <div
      className="position-relative zindex-0"
    >
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
          />
        </div>
      </ModalDialog.Header>
      <ModalDialog.Body className="pb-6">
        {isInitialized && children}
      </ModalDialog.Body>
      <EditorFooter
        clearSaveFailed={hooks.clearSaveError({ dispatch })}
        disableSave={!isInitialized}
        onCancel={openCancelConfirmModal}
        onSave={hooks.handleSaveClicked({
          dispatch,
          getContent,
          validateEntry,
          returnFunction,
        })}
        saveFailed={hooks.saveFailed()}
      />
    </div>
  );
};
EditorContainer.defaultProps = {
  onClose: null,
  returnFunction: null,
  validateEntry: null,
};
EditorContainer.propTypes = {
  children: PropTypes.node.isRequired,
  getContent: PropTypes.func.isRequired,
  onClose: PropTypes.func,
  returnFunction: PropTypes.func,
  validateEntry: PropTypes.func,
  // injected
  intl: intlShape.isRequired,
};

export default injectIntl(EditorContainer);
