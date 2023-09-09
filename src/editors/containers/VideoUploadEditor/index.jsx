import React from 'react';
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Spinner } from '@edx/paragon';
import './index.scss';
import messages from './messages';
import { VideoUploader } from './VideoUploader';

export const VideoUploadEditor = (
  {
    onClose,
  },
) => {
  const [loading, setLoading] = React.useState(false);
  const intl = useIntl();

  return (
    <div>
      {(!loading) ? (
        <div className="d-flex marked-area flex-column p-3">
          <VideoUploader setLoading={setLoading} onClose={onClose} />
        </div>
      ) : (
        <div className="text-center p-6">
          <Spinner
            animation="border"
            className="m-3"
            screenreadertext={intl.formatMessage(messages.spinnerScreenReaderText)}
          />
        </div>
      )}
    </div>
  );
};

VideoUploadEditor.propTypes = {
  onClose: PropTypes.func.isRequired,
};

export default VideoUploadEditor;
