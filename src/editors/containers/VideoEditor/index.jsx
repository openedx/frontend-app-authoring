import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import {
  Spinner,
} from '@openedx/paragon';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import { selectors } from '../../data/redux';
import { RequestKeys } from '../../data/constants/requests';

import EditorContainer from '../EditorContainer';
import VideoEditorModal from './components/VideoEditorModal';
import { ErrorContext, errorsHook, fetchVideoContent } from './hooks';
import messages from './messages';

export const VideoEditor = ({
  onClose,
  returnFunction,
  // injected
  intl,
  // redux
  studioViewFinished,
  isLibrary,
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
        returnFunction={returnFunction}
        validateEntry={validateEntry}
      >
        {studioViewFinished ? (
          <div className="video-editor">
            <VideoEditorModal {...{ isLibrary }} />
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
        )}
      </EditorContainer>
    </ErrorContext.Provider>
  );
};

VideoEditor.defaultProps = {
  onClose: null,
  returnFunction: null,
};
VideoEditor.propTypes = {
  onClose: PropTypes.func,
  returnFunction: PropTypes.func,
  // injected
  intl: intlShape.isRequired,
  // redux
  studioViewFinished: PropTypes.bool.isRequired,
  isLibrary: PropTypes.bool.isRequired,
};

export const mapStateToProps = (state) => ({
  studioViewFinished: selectors.requests.isFinished(state, { requestKey: RequestKeys.fetchStudioView }),
  isLibrary: selectors.app.isLibrary(state),
});

export const mapDispatchToProps = {};

export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(VideoEditor));
