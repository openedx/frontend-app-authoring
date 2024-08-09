import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from '@edx/frontend-platform/i18n';

import ErrorAlert from './ErrorAlert';

const FetchErrorAlert = ({
  message,
  isFetchError,
}) => (
  <ErrorAlert
    isError={isFetchError}
  >
    <FormattedMessage
      {...message}
    />
  </ErrorAlert>
);

FetchErrorAlert.propTypes = {
  message: PropTypes.shape({
    id: PropTypes.string,
    defaultMessage: PropTypes.string,
    description: PropTypes.string,
  }).isRequired,
  isFetchError: PropTypes.bool.isRequired,

};

export default FetchErrorAlert;
