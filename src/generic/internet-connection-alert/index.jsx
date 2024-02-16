import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Warning as WarningIcon } from '@openedx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';

import AlertMessage from '../alert-message';
import messages from './messages';

const InternetConnectionAlert = ({
  isFailed, isQueryPending, onQueryProcessing, onInternetConnectionFailed,
}) => {
  const intl = useIntl();
  const [showAlert, setShowAlert] = useState(false);
  const [isOnline, setIsOnline] = useState(window.navigator.onLine);

  useEffect(() => {
    const handleOnlineStatus = () => setIsOnline(window.navigator.onLine);
    const events = ['online', 'offline'];

    events.forEach(event => {
      window.addEventListener(event, handleOnlineStatus);
    });

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleOnlineStatus);
      });
    };
  }, [isOnline]);

  useEffect(() => {
    if (isQueryPending) {
      if (onQueryProcessing) {
        onQueryProcessing();
      }

      setShowAlert(!isOnline);

      if (!isOnline) {
        onInternetConnectionFailed();
      }
    } else if (isFailed) {
      setShowAlert(!isOnline);
    } else if (isOnline) {
      setShowAlert(false);
    }
  }, [isOnline, isQueryPending, isFailed]);

  return (
    <AlertMessage
      show={showAlert}
      variant="danger"
      icon={WarningIcon}
      title={intl.formatMessage(messages.offlineWarningTitle)}
      description={intl.formatMessage(messages.offlineWarningDescription)}
      aria-hidden="true"
      aria-labelledby={intl.formatMessage(
        messages.offlineWarningTitleAriaLabelledBy,
      )}
      aria-describedby={intl.formatMessage(
        messages.offlineWarningDescriptionAriaDescribedBy,
      )}
    />
  );
};

InternetConnectionAlert.defaultProps = {
  isQueryPending: false,
  onQueryProcessing: () => ({}),
  onInternetConnectionFailed: () => ({}),
};

InternetConnectionAlert.propTypes = {
  isFailed: PropTypes.bool.isRequired,
  isQueryPending: PropTypes.bool,
  onQueryProcessing: PropTypes.func,
  onInternetConnectionFailed: PropTypes.func,
};

export default InternetConnectionAlert;
