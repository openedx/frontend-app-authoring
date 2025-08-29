import React from 'react';
import { Alert } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import { useCalendarContext } from '../context/CalendarContext';
import messages from '../data/messages';

const ErrorDisplay = () => {
  const { intl } = useIntl();
  const { error, clearError } = useCalendarContext();

  if (!error) return null;

  const message = messages[error] || { id: error, defaultMessage: 'An error occurred.' };

  return (
    <Alert
      variant="danger"
      className="error-container"
      dismissible
      onClose={clearError}
    >
      {intl && intl.formatMessage ? intl.formatMessage(message) : message.defaultMessage}
    </Alert>
  );
};

export default ErrorDisplay;