import React from 'react';
import PropTypes from 'prop-types';

import { Alert } from '@openedx/paragon';
import { Error } from '@openedx/paragon/icons';

import { FormattedMessage } from '@edx/frontend-platform/i18n';
import messages from './messages';

export const hooks = {
  state: {
  // eslint-disable-next-line react-hooks/rules-of-hooks
    isDismissed: (val) => React.useState(val),
  },
  dismissalHooks: ({ dismissError, isError }) => {
    const [isDismissed, setIsDismissed] = hooks.state.isDismissed(false);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    React.useEffect(
      () => {
        setIsDismissed(isDismissed && !isError);
      },
      [isError],
    );
    return {
      isDismissed,
      dismissAlert: () => {
        setIsDismissed(true);
        if (dismissError) {
          dismissError();
        }
      },
    };
  },
};

const ErrorAlert = ({
  dismissError,
  hideHeading,
  isError,
  children,
}) => {
  const { isDismissed, dismissAlert } = hooks.dismissalHooks({ dismissError, isError });
  if (!isError || isDismissed) {
    return null;
  }
  return (
    <Alert
      variant="danger"
      icon={Error}
      dismissible
      onClose={dismissAlert}
    >
      {!hideHeading
        && (
          <Alert.Heading>
            <FormattedMessage {...messages.errorTitle} />
          </Alert.Heading>
        )}
      {children}
    </Alert>
  );
};

ErrorAlert.defaultProps = {
  dismissError: null,
  hideHeading: false,
};

ErrorAlert.propTypes = {
  dismissError: PropTypes.func,
  hideHeading: PropTypes.bool,
  isError: PropTypes.bool.isRequired,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
};

export default ErrorAlert;
