import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { injectIntl, FormattedMessage, intlShape } from '@edx/frontend-platform/i18n';
import {
  ActionRow,
  Button,
  ModalDialog,
  useToggle,
} from '@openedx/paragon';
import { isEmpty } from 'lodash';

import messages from './messages';

const FileValidationModal = ({
  handleFileOverwrite,
  // injected
  intl,
}) => {
  const [isOpen, open, close] = useToggle();

  const { duplicateFiles } = useSelector(state => state.assets);

  useEffect(() => {
    if (!isEmpty(duplicateFiles)) {
      open();
    }
  }, [duplicateFiles]);

  return (
    <ModalDialog
      title={intl.formatMessage(messages.overwriteModalTitle)}
      isOpen={isOpen}
      onClose={close}
      isOverflowVisible={false}
    >
      <ModalDialog.Header>
        <ModalDialog.Title>
          <FormattedMessage {...messages.overwriteModalTitle} />
        </ModalDialog.Title>
      </ModalDialog.Header>
      <ModalDialog.Body>
        <FormattedMessage {...messages.overwriteConfirmMessage} />
        <ul className="mt-2">
          {Object.keys(duplicateFiles).map(file => <li>{file}</li>)}
        </ul>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <ActionRow>
          <ModalDialog.CloseButton variant="tertiary">
            <FormattedMessage {...messages.cancelOverwriteButtonLabel} />
          </ModalDialog.CloseButton>
          <Button onClick={() => handleFileOverwrite(close, duplicateFiles)}>
            <FormattedMessage {...messages.confirmOverwriteButtonLabel} />
          </Button>
        </ActionRow>
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

FileValidationModal.propTypes = {
  handleFileOverwrite: PropTypes.func.isRequired,
  // injected
  intl: intlShape.isRequired,
};

export default injectIntl(FileValidationModal);
