import React from 'react';
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import messages from '../data/messages';

const NavigationButton = ({ type, onClick, className }) => {
  const  intl  = useIntl();

  return (
    <button
      onClick={onClick}
      className={`nav-button ${className || ''}`}
    >
      {intl && intl.formatMessage ? intl.formatMessage(messages[type]) : messages[type].defaultMessage}
    </button>
  );
};

NavigationButton.propTypes = {
  type: PropTypes.oneOf(['prev', 'next', 'today']).isRequired,
  onClick: PropTypes.func.isRequired,
  className: PropTypes.string,
};

NavigationButton.defaultProps = {
  className: '',
};

export default NavigationButton;