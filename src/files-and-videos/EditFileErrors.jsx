import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { ErrorAlert } from '@edx/frontend-lib-content-components';
import { RequestStatus } from '../data/constants';
import messages from './messages';

const EditFileErrors = ({
  resetErrors,
  errorMessages,
  addFileStatus,
  deleteFileStatus,
  updateFileStatus,
  // injected
  intl,
}) => (
  <>
    <ErrorAlert
      hideHeading={false}
      dismissError={() => resetErrors({ errorType: 'add' })}
      isError={addFileStatus === RequestStatus.FAILED}
    >
      <ul className="p-0">
        {errorMessages.add.map(message => (
          <li key={`add-error-${message}`} style={{ listStyle: 'none' }}>
            {intl.formatMessage(messages.errorAlertMessage, { message })}
          </li>
        ))}
      </ul>
    </ErrorAlert>
    <ErrorAlert
      hideHeading={false}
      dismissError={() => resetErrors({ errorType: 'delete' })}
      isError={deleteFileStatus === RequestStatus.FAILED}
    >
      <ul className="p-0">
        {errorMessages.delete.map(message => (
          <li key={`delete-error-${message}`} style={{ listStyle: 'none' }}>
            {intl.formatMessage(messages.errorAlertMessage, { message })}
          </li>
        ))}
      </ul>
    </ErrorAlert>
    <ErrorAlert
      hideHeading={false}
      dismissError={() => resetErrors({ errorType: 'update' })}
      isError={updateFileStatus === RequestStatus.FAILED}
    >
      <ul className="p-0">
        {errorMessages.lock?.map(message => (
          <li key={`lock-error-${message}`} style={{ listStyle: 'none' }}>
            {intl.formatMessage(messages.errorAlertMessage, { message })}
          </li>
        ))}
        {errorMessages.download.map(message => (
          <li key={`download-error-${message}`} style={{ listStyle: 'none' }}>
            {intl.formatMessage(messages.errorAlertMessage, { message })}
          </li>
        ))}
        {errorMessages.thumbnail?.map(message => (
          <li key={`add-thumbnail-error-${message}`} style={{ listStyle: 'none' }}>
            {intl.formatMessage(messages.errorAlertMessage, { message })}
          </li>
        ))}
      </ul>
    </ErrorAlert>
  </>
);

EditFileErrors.propTypes = {
  resetErrors: PropTypes.func.isRequired,
  errorMessages: PropTypes.shape({
    add: PropTypes.arrayOf(PropTypes.string).isRequired,
    delete: PropTypes.arrayOf(PropTypes.string).isRequired,
    lock: PropTypes.arrayOf(PropTypes.string),
    download: PropTypes.arrayOf(PropTypes.string).isRequired,
    usageMetrics: PropTypes.arrayOf(PropTypes.string).isRequired,
    thumbnail: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
  addFileStatus: PropTypes.string.isRequired,
  deleteFileStatus: PropTypes.string.isRequired,
  updateFileStatus: PropTypes.string.isRequired,
  // injected
  intl: intlShape.isRequired,
};

export default injectIntl(EditFileErrors);
