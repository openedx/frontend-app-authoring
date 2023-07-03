import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { Warning as WarningIcon } from '@edx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';

import AlertMessage from '../alert-message';
import messages from './messages';

const InternetConnectionAlert = ({
  isQueryPending, dispatchMethod, onInternetConnectionFailed, onDispatchMethodCall,
}) => {
  const intl = useIntl();
  const dispatch = useDispatch();
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
  }, []);

  useEffect(() => {
    if (isQueryPending && !isOnline) {
      setShowAlert(true);
      onInternetConnectionFailed();
    } else if (isQueryPending && isOnline) {
      dispatch(dispatchMethod);
      onDispatchMethodCall();
      setShowAlert(false);
    }
  }, [isOnline, isQueryPending]);

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
};

InternetConnectionAlert.propTypes = {
  isQueryPending: PropTypes.bool,
  dispatchMethod: PropTypes.func.isRequired,
  onDispatchMethodCall: PropTypes.func.isRequired,
  onInternetConnectionFailed: PropTypes.func.isRequired,
};

export default InternetConnectionAlert;
