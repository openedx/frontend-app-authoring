import React, { useEffect } from 'react';
import {
  Alert,
} from '@openedx/paragon';

import { Info } from '@openedx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';
import './TableView.scss';
import messages from './messages';

interface SaveErrorAlertProps {
  draftError: string | undefined;
  isError: boolean | undefined;
  isUpdateError: boolean | undefined;
}
const SaveErrorAlert = ({ draftError, isError, isUpdateError }: SaveErrorAlertProps) => {
  const intl = useIntl();
  const hasError: boolean = (isError || isUpdateError) && !!draftError;
  const [alertOpen, setAlertOpen] = React.useState(hasError);

  useEffect(() => {
    setAlertOpen(hasError);
  }, [hasError, isError, isUpdateError, draftError]);

  if (!alertOpen) { return null; }

  return (
    <Alert
      variant="danger"
      icon={Info}
      dismissible
      onClose={() => {
        setAlertOpen(false);
      }}
    >
      <Alert.Heading>
        {intl.formatMessage(messages.errorSavingTitle)}
      </Alert.Heading>
      {intl.formatMessage(messages.errorSavingMessage, { errorMessage: draftError })}
    </Alert>
  );
};

export default SaveErrorAlert;
