import React from 'react';
import { Alert } from '@openedx/paragon';
import PropTypes from 'prop-types';

const AlertMessage = ({
  title, titleId, description, descriptoinId, ...props
}) => (
  <Alert {...props}>
    <Alert.Heading id={titleId}>{title}</Alert.Heading>
    <span id={descriptoinId}>{description}</span>
  </Alert>
);

AlertMessage.propTypes = {
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  titleId: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  description: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  descriptoinId: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
};

AlertMessage.defaultProps = {
  title: undefined,
  titleId: undefined,
  description: undefined,
  descriptoinId: undefined,
};

export default AlertMessage;
