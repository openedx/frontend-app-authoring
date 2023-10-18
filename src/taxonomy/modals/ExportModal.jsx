import React, { useState } from 'react';
import {
  ActionRow,
  Button,
  Form,
  ModalDialog,
} from '@edx/paragon';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import messages from '../messages';

const ExportModal = ({
  taxonomyId,
  isOpen,
  onClose,
  intl,
}) => {
  const [modalSize, setModalSize] = useState('csv');

  return (
    <ModalDialog
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      hasCloseButton
      isFullscreenOnMobile
    >
      <ModalDialog.Header>
        <ModalDialog.Title>
          {intl.formatMessage(messages.exportModalTitle)}
        </ModalDialog.Title>
      </ModalDialog.Header>
      <ModalDialog.Body className="pb-5 mt-2">
        <Form.Group>
          <Form.Label>
            {intl.formatMessage(messages.exportModalBodyDescription)}
          </Form.Label>
          <Form.RadioSet
            name="export-format"
            value={modalSize}
            onChange={(e) => setModalSize(e.target.value)}
          >
            <Form.Radio
              key={`export-csv-format-${taxonomyId}`}
              value="csv"
            >
              {intl.formatMessage(messages.taxonomyCSVFormat)}
            </Form.Radio>
            <Form.Radio
              key={`export-json-format-${taxonomyId}`}
              value="json"
            >
              {intl.formatMessage(messages.taxonomyJSONFormat)}
            </Form.Radio>
          </Form.RadioSet>
        </Form.Group>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <ActionRow>
          <ModalDialog.CloseButton variant="tertiary">
            {intl.formatMessage(messages.taxonomyModalsCancelLabel)}
          </ModalDialog.CloseButton>
          <Button variant="primary">
            {intl.formatMessage(messages.exportModalSubmitButtonLabel)}
          </Button>
        </ActionRow>
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

ExportModal.propTypes = {
  taxonomyId: PropTypes.number.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  intl: intlShape.isRequired,
};

export default injectIntl(ExportModal);
