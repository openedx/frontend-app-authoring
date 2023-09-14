import React from 'react';
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Icon, IconButton, Dropzone, InputGroup, FormControl,
} from '@edx/paragon';
import { ArrowForward, FileUpload, Close } from '@edx/paragon/icons';
import { useDispatch } from 'react-redux';
import { thunkActions } from '../../data/redux';
import * as hooks from './hooks';
import * as editorHooks from '../EditorContainer/hooks';
import messages from './messages';

const URLUploader = () => {
  const [textInputValue, setTextInputValue] = React.useState('');
  const onURLUpload = hooks.onVideoUpload();
  const intl = useIntl();
  return (
    <div className="d-flex flex-column">
      <div style={{ backgroundColor: '#F2F0EF' }} className="justify-content-center align-self-center rounded-circle p-5">
        <Icon src={FileUpload} className="text-muted" size="lg" />
      </div>
      <div className="d-flex align-self-center justify-content-center flex-wrap flex-column pt-5">
        <span className="small">{intl.formatMessage(messages.dropVideoFileHere)}</span>
        <span className="align-self-center" style={{ fontSize: '0.8rem' }}>{intl.formatMessage(messages.info)}</span>
      </div>
      <div className="x-small align-self-center justify-content-center mx-2 text-dark font-weight-normal">OR</div>
      <div className="zindex-9 video-id-prompt p-4">
        <InputGroup>
          <FormControl
            placeholder={intl.formatMessage(messages.pasteURL)}
            aria-label={intl.formatMessage(messages.pasteURL)}
            aria-describedby="basic-addon2"
            borderless
            onClick={(event) => { event.stopPropagation(); }}
            onChange={(event) => { setTextInputValue(event.target.value); }}
          />
          <div className="light-300 justify-content-center align-self-center bg-light rounded-circle p-0 x-small url-submit-button">
            <IconButton
              className="text-muted"
              alt={intl.formatMessage(messages.submitButtonAltText)}
              src={ArrowForward}
              iconAs={Icon}
              size="inline"
              onClick={(event) => {
                event.stopPropagation();
                if (textInputValue.trim() !== '') {
                  onURLUpload(textInputValue);
                }
              }}
            />
          </div>
        </InputGroup>
      </div>
    </div>
  );
};

export const VideoUploader = ({ setLoading, onClose }) => {
  const dispatch = useDispatch();
  const intl = useIntl();
  const handleCancel = editorHooks.handleCancel({ onClose });

  const handleProcessUpload = ({ fileData }) => {
    dispatch(thunkActions.video.uploadVideo({
      supportedFiles: [fileData],
      setLoadSpinner: setLoading,
      postUploadRedirect: hooks.onVideoUpload(),
    }));
  };

  return (
    <div className="d-flex flex-column">
      <div className="d-flex justify-content-end flex-row">
        <IconButton
          className="position-absolute mr-2 mt-2"
          alt={intl.formatMessage(messages.closeButtonAltText)}
          src={Close}
          iconAs={Icon}
          onClick={handleCancel}
        />
      </div>
      <Dropzone
        accept={{ 'video/*': ['.mp4', '.mov'] }}
        onProcessUpload={handleProcessUpload}
        inputComponent={<URLUploader />}
      />
    </div>
  );
};

VideoUploader.propTypes = {
  setLoading: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default VideoUploader;
