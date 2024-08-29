import React from 'react';
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Icon, IconButton, Dropzone, InputGroup, FormControl,
} from '@openedx/paragon';
import { ArrowForward, FileUpload, Close } from '@openedx/paragon/icons';
import { useDispatch } from 'react-redux';
import { thunkActions } from '../../data/redux';
import * as hooks from './hooks';
import messages from './messages';

const URLUploader = () => {
  const [textInputValue, setTextInputValue] = React.useState('');
  const onURLUpload = hooks.onVideoUpload('selectedVideoUrl');
  const intl = useIntl();
  return (
    <div className="d-flex flex-column">
      <div className="justify-content-center align-self-center rounded-circle bg-light-300 p-2.5">
        <Icon src={FileUpload} className="text-muted" style={{ height: '2rem', width: '2rem' }} />
      </div>
      <div className="d-flex align-self-center justify-content-center flex-wrap flex-column pt-3">
        <span>{intl.formatMessage(messages.dropVideoFileHere)}</span>
        <span className="x-small align-self-center pt-2">{intl.formatMessage(messages.info)}</span>
      </div>
      <div className="small align-self-center justify-content-center mx-2 text-dark font-weight-normal pt-3">
        OR
      </div>
      <div className="zindex-9 video-id-prompt py-3">
        <InputGroup>
          <FormControl
            className="m-0"
            placeholder={intl.formatMessage(messages.pasteURL)}
            aria-label={intl.formatMessage(messages.pasteURL)}
            aria-describedby="basic-addon2"
            borderless
            onClick={(event) => { event.stopPropagation(); }}
            onChange={(event) => { setTextInputValue(event.target.value); }}
            trailingElement={(
              <IconButton
                className="url-submit-button"
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
            )}
          />
        </InputGroup>
      </div>
    </div>
  );
};

export const VideoUploader = ({ setLoading }) => {
  const dispatch = useDispatch();
  const intl = useIntl();
  const goBack = hooks.useHistoryGoBack();

  const handleProcessUpload = ({ fileData }) => {
    dispatch(thunkActions.video.uploadVideo({
      supportedFiles: [fileData],
      setLoadSpinner: setLoading,
      postUploadRedirect: hooks.onVideoUpload('selectedVideoId'),
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
          onClick={goBack}
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
};

export default VideoUploader;
