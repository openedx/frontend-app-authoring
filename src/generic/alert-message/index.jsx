import React from 'react';
import { Alert } from '@edx/paragon';
import PropTypes from 'prop-types';

const AlertMessage = ({ title, description, ...props }) => (
  <Alert {...props}>
    <Alert.Heading>{title}</Alert.Heading>
    <p>{description}</p>
  </Alert>
);

AlertMessage.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
};

AlertMessage.defaultProps = {
  title: undefined,
  description: undefined,
};

export default AlertMessage;
