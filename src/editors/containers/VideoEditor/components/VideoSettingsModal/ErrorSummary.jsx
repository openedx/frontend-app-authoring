import React from 'react';
import { FormattedMessage } from '@edx/frontend-platform/i18n';

import { Alert } from '@openedx/paragon';
import { InfoOutline } from '@openedx/paragon/icons';

import messages from './components/messages';
import { ErrorContext } from '../../hooks';
// This 'module' self-import hack enables mocking during tests.
// See src/editors/decisions/0005-internal-editor-testability-decisions.md. The whole approach to how hooks are tested
// should be re-thought and cleaned up to avoid this pattern.
// eslint-disable-next-line import/no-self-import
import * as module from './ErrorSummary';

export const hasNoError = (error) => Object.keys(error[0]).length === 0;

export const showAlert = (errors) => !Object.values(errors).every(module.hasNoError);

export const ErrorSummary = () => {
  const errors = React.useContext(ErrorContext);
  return (
    <Alert
      icon={InfoOutline}
      show={module.showAlert(errors)}
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
