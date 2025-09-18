import React from 'react';
import { Alert } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import { useAssignmentContext } from '../context/AssignmentContext';

const ErrorDisplay = () => {
  const intl = useIntl();
  const { error, clearError } = useAssignmentContext();

  if (!error) return null;

  return (
    <Alert variant="danger" dismissible onClose={clearError}>
      {intl.formatMessage(error)}
    </Alert>
  );
};

export default ErrorDisplay;
