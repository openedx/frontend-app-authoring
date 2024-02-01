import { Alert } from '@openedx/paragon';
import React from 'react';
import PropTypes from 'prop-types';

const AlertProctoringError = ({ proctoringErrorsData, children, ...props }) => (
  <ul className="alert-proctoring-error p-0">
    <Alert {...props}>
      {children}
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
  children: PropTypes.node,
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
  children: null,
};

export default AlertProctoringError;
