import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import {
  Spinner,
} from '@edx/paragon';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import { selectors } from '../../data/redux';
import { RequestKeys } from '../../data/constants/requests';

import EditorContainer from '../EditorContainer';
import VideoEditorModal from './components/VideoEditorModal';
import { ErrorContext, errorsHook, fetchVideoContent } from './hooks';
import messages from './messages';

export const VideoEditor = ({
  onClose,
  // injected
  intl,
  // redux
  studioViewFinished,
}) => {
  const {
    error,
    validateEntry,
  } = errorsHook();
  return (
    <ErrorContext.Provider value={error}>
      <EditorContainer
        getContent={fetchVideoContent()}
        onClose={onClose}
        validateEntry={validateEntry}
      >
        {studioViewFinished ? (
          <div className="video-editor">
            <VideoEditorModal />
          </div>
        ) : (
          <Spinner
            animation="border"
            className="m-3"
            screenreadertext={intl.formatMessage(messages.spinnerScreenReaderText)}
          />
        )}
      </EditorContainer>
    </ErrorContext.Provider>
  );
};

VideoEditor.defaultProps = {
  onClose: null,
};
VideoEditor.propTypes = {
  onClose: PropTypes.func,
  // injected
  intl: intlShape.isRequired,
  // redux
  studioViewFinished: PropTypes.bool.isRequired,
};

export const mapStateToProps = (state) => ({
  studioViewFinished: selectors.requests.isFinished(state, { requestKey: RequestKeys.fetchStudioView }),
});

export const mapDispatchToProps = {};

export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(VideoEditor));
