import React from 'react';
import { Alert } from '@edx/paragon';
import PropTypes from 'prop-types';

const AlertMessage = ({ title, description, ...props }) => (
  <Alert {...props}>
    <Alert.Heading>{title}</Alert.Heading>
    <span>{description}</span>
  </Alert>
);

AlertMessage.propTypes = {
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  description: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
};

AlertMessage.defaultProps = {
  title: undefined,
  description: undefined,
};

export default AlertMessage;
