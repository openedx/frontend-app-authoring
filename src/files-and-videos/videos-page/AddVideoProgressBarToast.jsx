import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Toast, ProgressBar } from '@openedx/paragon';
import messages from './messages';

const AddVideoProgressBarToast = ({
  uploadVideoProgress,
  intl,
}) => {
  let isOpen = false;
  useEffect(() => {
    isOpen = !!uploadVideoProgress;
  }, [uploadVideoProgress]);

  return (
    <Toast
      show={isOpen}
    >
      {intl.formatMessage(messages.videoUploadProgressBarLabel)}
      <ProgressBar now={uploadVideoProgress} label={uploadVideoProgress.toString()} variant="primary" />
    </Toast>
  );
};

AddVideoProgressBarToast.defaultProps = {
  uploadVideoProgress: 0,
};
AddVideoProgressBarToast.propTypes = {
  uploadVideoProgress: PropTypes.number,
  // injected
  intl: intlShape.isRequired,
};

export default injectIntl(AddVideoProgressBarToast);
