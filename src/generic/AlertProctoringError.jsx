import { Alert } from '@edx/paragon';
import React from 'react';
import PropTypes from 'prop-types';

const AlertProctoringError = ({ proctoringErrorsData, ...props }) => (
  <ul className="alert-proctoring-error p-0">
    <Alert {...props}>
      {proctoringErrorsData.map(({ key, model, message }) => (
        <li key={key}>
          <Alert.Heading>{model.displayName}</Alert.Heading>
          <p>{message}</p>
        </li>
      ))}
    </Alert>
  </ul>
);

AlertProctoringError.propTypes = {
  variant: PropTypes.string,
  proctoringErrorsData: PropTypes.arrayOf(PropTypes.shape({
    key: PropTypes.string,
    message: PropTypes.string,
    model: PropTypes.shape({
      deprecated: PropTypes.bool,
      displayName: PropTypes.string,
      help: PropTypes.string,
      hideOnEnabledPublisher: PropTypes.bool,
    }),
    value: PropTypes.string,
  })).isRequired,
};

AlertProctoringError.defaultProps = {
  variant: 'danger',
};

export default AlertProctoringError;
