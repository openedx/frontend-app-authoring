import { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Error as ErrorIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
} from '@openedx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';

import AlertMessage from '../../../generic/alert-message';
import { ActionButton, AlertContent } from './components';
import { getAlertStatus } from './utils';
import { initialNotificationAlertsState } from './constants';
import messages from './messages';

const PastNotificationAlert = ({ staticFileNotices, courseId }) => {
  const intl = useIntl();
  const [notificationAlerts, toggleNotificationAlerts] = useState(initialNotificationAlertsState);
  const { conflictingFiles, errorFiles, newFiles } = staticFileNotices;

  const hasConflictingErrors = getAlertStatus(conflictingFiles, 'conflictingFilesAlert', notificationAlerts);
  const hasErrorFiles = getAlertStatus(errorFiles, 'errorFilesAlert', notificationAlerts);
  const hasNewFiles = getAlertStatus(newFiles, 'newFilesAlert', notificationAlerts);

  const handleCloseNotificationAlert = (alertKey) => {
    toggleNotificationAlerts((prevAlerts) => ({
      ...prevAlerts,
      [alertKey]: false,
    }));
  };

  return (
    <>
      {hasConflictingErrors && (
        <AlertMessage
          data-testid="has-conflicting-errors-alert"
          className="course-unit__alert"
          title={intl.formatMessage(messages.hasConflictingErrorsTitle)}
          onClose={() => handleCloseNotificationAlert('conflictingFilesAlert')}
          description={(
            <AlertContent
              fileList={conflictingFiles}
              text={intl.formatMessage(messages.hasConflictingErrorsDescription)}
            />
          )}
          variant="warning"
          icon={WarningIcon}
          dismissible
          actions={[
            <ActionButton
              courseId={courseId}
              title={intl.formatMessage(messages.hasConflictingErrorsButtonText)}
            />,
          ]}
        />
      )}
      {hasErrorFiles && (
        <AlertMessage
          data-testid="has-error-files-alert"
          className="course-unit__alert"
          title={intl.formatMessage(messages.hasErrorsTitle)}
          onClose={() => handleCloseNotificationAlert('errorFilesAlert')}
          description={(
            <AlertContent
              fileList={errorFiles}
              text={intl.formatMessage(messages.hasErrorsDescription)}
            />
          )}
          variant="danger"
          icon={ErrorIcon}
          dismissible
        />
      )}
      {hasNewFiles && (
        <AlertMessage
          data-testid="has-new-files-alert"
          className="course-unit__alert"
          title={intl.formatMessage(messages.hasNewFilesTitle)}
          onClose={() => handleCloseNotificationAlert('newFilesAlert')}
          description={(
            <AlertContent
              fileList={newFiles}
              text={intl.formatMessage(messages.hasNewFilesDescription)}
            />
          )}
          variant="info"
          icon={InfoIcon}
          dismissible
          actions={[
            <ActionButton
              courseId={courseId}
              title={intl.formatMessage(messages.hasNewFilesButtonText)}
            />,
          ]}
        />
      )}
    </>
  );
};

PastNotificationAlert.propTypes = {
  courseId: PropTypes.string.isRequired,
  staticFileNotices:
    PropTypes.objectOf({
      conflictingFiles: PropTypes.arrayOf(PropTypes.string),
      errorFiles: PropTypes.arrayOf(PropTypes.string),
      newFiles: PropTypes.arrayOf(PropTypes.string),
    }),
};

PastNotificationAlert.defaultProps = {
  staticFileNotices: {},
};

export default PastNotificationAlert;
