import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from '@edx/frontend-platform/i18n';

import ErrorAlert from './ErrorAlert';

const UploadErrorAlert = ({
  message,
  isUploadError,
}) => (
  <ErrorAlert
    isError={isUploadError}
  >
    <FormattedMessage
      {...message}
    />
  </ErrorAlert>
);

UploadErrorAlert.propTypes = {
  message: PropTypes.shape({
    id: PropTypes.string,
    defaultMessage: PropTypes.string,
    description: PropTypes.string,
  }).isRequired,
  isUploadError: PropTypes.bool.isRequired,
};

export default UploadErrorAlert;
