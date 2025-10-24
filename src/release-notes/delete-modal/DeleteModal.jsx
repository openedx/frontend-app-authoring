import React from 'react';
import PropTypes from 'prop-types';
import {
  ActionRow,
  Button,
  AlertModal,
  Alert,
} from '@openedx/paragon';
import { Info } from '@openedx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';

import messages from './messages';
import releaseNotesMessages from '../messages';

const DeleteModal = ({
  isOpen, close, onDeleteSubmit, errorDeleting,
}) => {
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
      {errorDeleting && (
        <Alert variant="danger" icon={Info} className="mb-3">
          {intl.formatMessage(releaseNotesMessages.errorDeletingPost)}
        </Alert>
      )}
      <p>{intl.formatMessage(messages.deleteModalDescription)}</p>
    </AlertModal>
  );
};

DeleteModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  close: PropTypes.func.isRequired,
  onDeleteSubmit: PropTypes.func.isRequired,
  errorDeleting: PropTypes.bool,
};

DeleteModal.defaultProps = {
  errorDeleting: false,
};

export default DeleteModal;
