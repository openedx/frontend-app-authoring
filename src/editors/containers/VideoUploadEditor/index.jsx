import React from 'react';
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Icon, IconButton, Spinner,
} from '@edx/paragon';
import { Close } from '@edx/paragon/icons';
import { connect } from 'react-redux';
import { thunkActions } from '../../data/redux';
import './index.scss';
import * as hooks from './hooks';
import messages from './messages';
import * as editorHooks from '../EditorContainer/hooks';
import { VideoUploader } from './VideoUploader';
import * as editorHooks from '../EditorContainer/hooks';

export const VideoUploadEditor = (
  {
    onClose,
    // Redux states
    uploadVideo,
  },
) => {
  const [loading, setLoading] = React.useState(false);
  const handleCancel = editorHooks.handleCancel({ onClose });
  const intl = useIntl();

  return (
    <div>
      {(!loading) ? (
        <div className="marked-area">
          <div className="d-flex justify-content-end close-button-container">
            <IconButton
              alt={intl.formatMessage(messages.closeButtonAltText)}
              src={Close}
              iconAs={Icon}
              onClick={handleCancel}
            />
          </div>
          <VideoUploader onUpload={uploadVideo} setLoading={setLoading} />
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
  uploadVideo: PropTypes.func.isRequired,
};

export const mapStateToProps = () => ({});

export const mapDispatchToProps = {
  uploadVideo: thunkActions.video.uploadVideo,
};

export default connect(mapStateToProps, mapDispatchToProps)(VideoUploadEditor);
