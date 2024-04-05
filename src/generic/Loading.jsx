import React from 'react';
import PropTypes from 'prop-types';
import { Spinner } from '@openedx/paragon';
import { FormattedMessage } from '@edx/frontend-platform/i18n';

export const LoadingSpinner = ({ size }) => (
  <Spinner
    animation="border"
    role="status"
    variant="primary"
    size={size}
    screenReaderText={(
      <FormattedMessage
        id="authoring.loading"
        defaultMessage="Loading..."
        description="Screen-reader message for when a page is loading."
      />
    )}
  />
);

LoadingSpinner.defaultProps = {
  size: undefined,
};

LoadingSpinner.propTypes = {
  size: PropTypes.string,
};

const Loading = () => (
  <div className="d-flex justify-content-center align-items-center flex-column vh-100">
    <LoadingSpinner />
  </div>
);

export default Loading;
