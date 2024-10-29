import React from 'react';
import { FormattedMessage } from '@edx/frontend-platform/i18n';

import { Alert } from '@openedx/paragon';
import { InfoOutline } from '@openedx/paragon/icons';

import messages from './components/messages';
import { ErrorContext } from '../../hooks';

export const hasNoError = (error) => Object.keys(error[0]).length === 0;

export const showAlert = (errors) => !Object.values(errors).every(hasNoError);

export const ErrorSummary = () => {
  const errors = React.useContext(ErrorContext);
  return (
    <Alert
      icon={InfoOutline}
      show={showAlert(errors)}
      variant="danger"
    >
      <Alert.Heading>
        <FormattedMessage {...messages.validateErrorTitle} />
      </Alert.Heading>
      <p>
        <FormattedMessage {...messages.validateErrorBody} />
      </p>
    </Alert>
  );
};
