import React from 'react';
import { Alert } from '@openedx/paragon';
import PropTypes from 'prop-types';

const AlertMessage = ({ title, description, ...props }) => (
  <Alert {...props}>
    <Alert.Heading>{title}</Alert.Heading>
    <div>{description}</div>
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
