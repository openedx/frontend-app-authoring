import React from 'react';
import PropTypes from 'prop-types';
import {
  ActionRow,
  Button,
  AlertModal,
} from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';

import messages from './messages';

const DeleteModal = ({ isOpen, close, onDeleteSubmit }) => {
  const intl = useIntl();

  return (
    <AlertModal
      title={intl.formatMessage(messages.deleteModalTitle)}
      isOpen={isOpen}
      onClose={close}
      footerNode={(
        <ActionRow>
          <Button variant="tertiary" onClick={close}>
            {intl.formatMessage(messages.cancelButton)}
          </Button>
          <Button
            onClick={(e) => {
              e.preventDefault();
              onDeleteSubmit();
            }}
          >
            {intl.formatMessage(messages.deleteButton)}
          </Button>
        </ActionRow>
      )}
    >
      <p>{intl.formatMessage(messages.deleteModalDescription)}</p>
    </AlertModal>
  );
};

DeleteModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  close: PropTypes.func.isRequired,
  onDeleteSubmit: PropTypes.func.isRequired,
};

export default DeleteModal;
