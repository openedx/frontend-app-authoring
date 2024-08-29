import React, { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { isEmpty } from 'lodash';
import { Button, Stack } from '@openedx/paragon';
import { Add } from '@openedx/paragon/icons';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import ErrorAlert from '../../../editors/sharedComponents/ErrorAlerts/ErrorAlert';
import { getLanguages, getSortedTranscripts } from '../data/utils';
import Transcript from './transcript-item';
import {
  deleteVideoTranscript,
  downloadVideoTranscript,
  resetErrors,
  uploadVideoTranscript,
} from '../data/thunks';
import { RequestStatus } from '../../../data/constants';
import messages from './messages';

const TranscriptTab = ({
  video,
  // injected
  intl,
}) => {
  const dispatch = useDispatch();
  const divRef = useRef(null);
  const { transcriptStatus, errors } = useSelector(state => state.videos);
  const {
    transcriptAvailableLanguages,
    videoTranscriptSettings,
  } = useSelector(state => state.videos.pageSettings);
  const {
    transcriptDeleteHandlerUrl,
    transcriptUploadHandlerUrl,
    transcriptDownloadHandlerUrl,
  } = videoTranscriptSettings;
  const { transcripts, id, displayName } = video;
  const languages = getLanguages(transcriptAvailableLanguages);
  let sortedTranscripts = getSortedTranscripts(languages, transcripts);
  const [previousSelection, setPreviousSelection] = useState(sortedTranscripts);

  useEffect(() => {
    dispatch(resetErrors({ errorType: 'transcript' }));
    sortedTranscripts = getSortedTranscripts(languages, transcripts);
    setPreviousSelection(sortedTranscripts);
  }, [transcripts]);

  const handleAddEmptyTranscript = () => {
    setPreviousSelection(['', ...previousSelection]);
    if (divRef?.current?.scrollTo) {
      divRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleTranscript = (data, actionType) => {
    const {
      language,
      newLanguage,
      file,
    } = data;
    dispatch(resetErrors({ errorType: 'transcript' }));
    switch (actionType) {
      case 'delete':
        if (isEmpty(language)) {
          const updatedSelection = previousSelection;
          updatedSelection.shift();
          setPreviousSelection(updatedSelection);
        } else {
          dispatch(deleteVideoTranscript({
            language,
            videoId: id,
            apiUrl: transcriptDeleteHandlerUrl,
            transcripts,
          }));
        }
        break;
      case 'download':
        dispatch(downloadVideoTranscript({
          filename: `${displayName}-${language}.srt`,
          language,
          videoId: id,
          apiUrl: transcriptDownloadHandlerUrl,
        }));
        break;
      case 'upload':
        dispatch(uploadVideoTranscript({
          language,
          videoId: id,
          apiUrl: transcriptUploadHandlerUrl,
          newLanguage,
          file,
          transcripts,
        }));
        break;
      default:
        break;
    }
  };

  return (
    <Stack gap={3}>
      <div ref={divRef} style={{ overflowY: 'auto', maxHeight: '310px' }} className="px-1 py-2">
        <ErrorAlert
          hideHeading={false}
          isError={transcriptStatus === RequestStatus.FAILED && !isEmpty(errors.transcript)}
        >
          <ul className="p-0">
            {errors.transcript.map(message => (
              <li key={`transcript-error-${message}`} style={{ listStyle: 'none' }}>
                {intl.formatMessage(messages.errorAlertMessage, { message })}
              </li>
            ))}
          </ul>
        </ErrorAlert>
        {previousSelection.map(transcript => (
          <Transcript
            {...{
              languages,
              transcript,
              previousSelection,
              handleTranscript,
            }}
          />
        ))}
      </div>
      <div className="border-top border-light-400">
        <Button
          variant="link"
          iconBefore={Add}
          size="sm"
          className="text-primary-500 justify-content-start pl-0 pt-3"
          onClick={handleAddEmptyTranscript}
        >
          {intl.formatMessage(messages.uploadButtonLabel)}
        </Button>
      </div>
    </Stack>
  );
};

TranscriptTab.propTypes = {
  video: PropTypes.shape({
    transcripts: PropTypes.arrayOf(PropTypes.string).isRequired,
    id: PropTypes.string.isRequired,
    displayName: PropTypes.string.isRequired,
  }).isRequired,
  // injected
  intl: intlShape.isRequired,
};

export default injectIntl(TranscriptTab);
