import React from 'react';
import { useSelector } from 'react-redux';
import {
  Spinner,
} from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';

import { selectors } from '../../data/redux';
import { RequestKeys } from '../../data/constants/requests';

import { EditorComponent } from '../../EditorComponent';
import EditorContainer from '../EditorContainer';
import VideoEditorModal from './components/VideoEditorModal';
import { ErrorContext, errorsHook, fetchVideoContent } from './hooks';
import messages from './messages';

const VideoEditor: React.FC<EditorComponent> = ({
  onClose,
  returnFunction,
}) => {
  const intl = useIntl();
  const studioViewFinished = useSelector(
    (state) => selectors.requests.isFinished(state, { requestKey: RequestKeys.fetchStudioView }),
  );
  const isLibrary = useSelector(selectors.app.isLibrary) as boolean;
  const {
    error,
    validateEntry,
  } = errorsHook();
  return (
    <ErrorContext.Provider value={error}>
      <EditorContainer
        getContent={fetchVideoContent()}
        isDirty={/* istanbul ignore next */ () => true}
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

export default VideoEditor;
