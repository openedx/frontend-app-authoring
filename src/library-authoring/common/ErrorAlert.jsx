import { Alert, Col } from '@edx/paragon';
import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from '@edx/frontend-platform/i18n';
import { truncateMessage } from './data';
import commonMessages from './messages';

// eslint-disable-next-line import/prefer-default-export
export const ErrorAlert = injectIntl(({ intl, errorMessage, onClose }) => (
  errorMessage !== null && (
    <Col xs={12} className="mt-4">
      <Alert
        variant="danger"
        onClose={onClose}
        dismissible
      >
        {truncateMessage(errorMessage || intl.formatMessage(commonMessages['library.server.error.generic']))}
      </Alert>
    </Col>
  )
));

ErrorAlert.propTypes = {
  errorMessage: PropTypes.string,
  onClose: PropTypes.func.isRequired,
};
