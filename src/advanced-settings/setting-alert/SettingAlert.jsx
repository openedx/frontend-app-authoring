import React from 'react';
import { Alert } from '@edx/paragon';
import PropTypes from 'prop-types';

const SettingAlert = ({
  title, description, ...props
}) => (
  <Alert {...props}>
    <Alert.Heading>{title}</Alert.Heading>
    <p>{description}</p>
  </Alert>
);

SettingAlert.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
};

SettingAlert.defaultProps = {
  title: undefined,
  description: undefined,
};

export default SettingAlert;
