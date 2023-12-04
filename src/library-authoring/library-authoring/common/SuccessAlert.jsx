import { Alert, Col } from '@edx/paragon';
import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from '@edx/frontend-platform/i18n';
import { truncateMessage } from './data';

// eslint-disable-next-line import/prefer-default-export
export const SuccessAlert = injectIntl(({ successMessage, onClose }) => (
  successMessage !== null && (
    <Col xs={12} className="mt-4">
      <Alert
        variant="success"
        onClose={onClose}
        dismissible
      >
        {truncateMessage(successMessage)}
      </Alert>
    </Col>
  )
));

SuccessAlert.propTypes = {
  successMessage: PropTypes.string,
  onClose: PropTypes.func.isRequired,
};
