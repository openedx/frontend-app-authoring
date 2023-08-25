import React from 'react';
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Icon, IconButton, Dropzone, InputGroup, FormControl,
} from '@edx/paragon';
import { ArrowForward, FileUpload } from '@edx/paragon/icons';
import { useDispatch } from 'react-redux';
import { thunkActions } from '../../data/redux';
import * as hooks from './hooks';
import messages from './messages';

const URLUploader = () => {
  const intl = useIntl();
  return (
    <div className="d-flex flex-column flex-wrap">
      <div className="justify-content-center align-self-center bg-light rounded-circle p-4">
        <Icon src={FileUpload} className="text-muted" />
      </div>
      <div className="d-flex align-self-center justify-content-center flex-wrap flex-column pt-5">
        <span style={{ fontSize: '1.35rem' }}>{intl.formatMessage(messages.dropVideoFileHere)}</span>
        <span className="align-self-center" style={{ fontSize: '0.8rem' }}>{intl.formatMessage(messages.info)}</span>
      </div>
      <div className="align-self-center justify-content-center mx-2 text-dark">OR</div>
    </div>
  );
};

export const VideoUploader = ({ setLoading }) => {
  const [textInputValue, setTextInputValue] = React.useState('');
  const onURLUpload = hooks.onVideoUpload();
  const intl = useIntl();
  const dispatch = useDispatch();

  const handleProcessUpload = ({ fileData }) => {
    dispatch(thunkActions.video.uploadVideo({
      supportedFiles: [fileData],
      setLoadSpinner: setLoading,
      postUploadRedirect: hooks.onVideoUpload(),
    }));
  };

  return (
    <div>
      <Dropzone
        accept={{ 'video/*': ['.mp4', '.mov'] }}
        onProcessUpload={handleProcessUpload}
        inputComponent={<URLUploader />}
      />
      <div className="d-flex video-id-prompt">
        <InputGroup>
          <FormControl
            placeholder={intl.formatMessage(messages.pasteURL)}
            aria-label={intl.formatMessage(messages.pasteURL)}
            aria-describedby="basic-addon2"
            borderless
            onChange={(event) => { setTextInputValue(event.target.value); }}
          />
          <div className="justify-content-center align-self-center bg-light rounded-circle p-0 x-small url-submit-button">
            <IconButton
              alt={intl.formatMessage(messages.submitButtonAltText)}
              src={ArrowForward}
              iconAs={Icon}
              size="inline"
              onClick={() => { onURLUpload(textInputValue); }}
            />
          </div>
        </InputGroup>
      </div>
    </div>
  );
};

VideoUploader.propTypes = {
  setLoading: PropTypes.func.isRequired,
};

export default VideoUploader;
