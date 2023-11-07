import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { isEmpty } from 'lodash';
import { ErrorAlert } from '@edx/frontend-lib-content-components';
import { Button, Stack } from '@edx/paragon';
import { Add } from '@edx/paragon/icons';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { getLanguages } from '../data/utils';
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

  const [previousSelection, setPreviousSelection] = useState(transcripts);
  useEffect(() => {
    dispatch(resetErrors({ errorType: 'transcript' }));
    setPreviousSelection(transcripts);
  }, [transcripts]);

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
        const updatedSelection = previousSelection.filter(selection => selection !== '');
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
    <Stack gap={3} className="mt-3">
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
      <Button
        variant="link"
        iconBefore={Add}
        size="sm"
        className="text-primary-500 justify-content-start pl-0"
        onClick={() => setPreviousSelection([...previousSelection, ''])}
      >
        {intl.formatMessage(messages.uploadButtonLabel)}
      </Button>
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
