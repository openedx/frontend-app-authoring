import React from 'react';
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Spinner } from '@openedx/paragon';
import './index.scss';
import messages from './messages';
import { VideoUploader } from './VideoUploader';

const VideoUploadEditor = ({ onUpload, onClose }) => {
  const [loading, setLoading] = React.useState(false);
  const intl = useIntl();

  return (!loading) ? (
    <div className="d-flex marked-area flex-column p-3">
      <VideoUploader onUpload={onUpload} onClose={onClose} setLoading={setLoading} />
    </div>
  ) : (
    <div style={{
      position: 'absolute',
      left: '50%',
      top: '50%',
      transform: 'translate(-50%, -50%)',
    }}
    >
      <Spinner
        animation="border"
        className="m-3"
        screenreadertext={intl.formatMessage(messages.spinnerScreenReaderText)}
      />
    </div>
  );
};

VideoUploadEditor.propTypes = {
  onUpload: PropTypes.func,
  onClose: PropTypes.func,
};

export default VideoUploadEditor;
