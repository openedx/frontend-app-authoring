import { useEffect, useState } from 'react';
import { Warning as WarningIcon } from '@openedx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';

import AlertMessage from '../alert-message';
import messages from './messages';

export interface SavingErrorAlertProps {
  isQueryFailed: boolean;
  errorMessage?: string;
}

const SavingErrorAlert = ({
  isQueryFailed,
  errorMessage,
}: SavingErrorAlertProps) => {
  const intl = useIntl();
  const [showAlert, setShowAlert] = useState(false);
  const [isOnline, setIsOnline] = useState(window.navigator.onLine);

  useEffect(() => {
    const handleOnlineStatus = () => setIsOnline(window.navigator.onLine);
    const events = ['online', 'offline'];

    events.forEach((event) => {
      window.addEventListener(event, handleOnlineStatus);
    });

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleOnlineStatus);
      });
    };
  }, [isOnline]);

  useEffect(() => {
    setShowAlert((!isOnline && isQueryFailed) || isQueryFailed);
  }, [isQueryFailed, isOnline]);

  return (
    <AlertMessage
      show={showAlert}
      variant="danger"
      data-testid="saving-error-alert"
      icon={WarningIcon}
      title={intl.formatMessage(messages.warningTitle)}
      description={errorMessage || intl.formatMessage(messages.warningDescription)}
      aria-hidden="true"
      aria-labelledby={intl.formatMessage(
        messages.warningTitleAriaLabelledBy,
      )}
      aria-describedby={intl.formatMessage(
        messages.warningDescriptionAriaDescribedBy,
      )}
    />
  );
};

export default SavingErrorAlert;
