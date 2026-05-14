import React, {
  useEffect, useMemo, useState, useRef,
} from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { isEmpty } from 'lodash';
import {
  Button,
  Icon,
  IconButton,
  Spinner,
  Stack,
  Toast,
} from '@openedx/paragon';
import {
  Add,
  CheckCircle,
  Delete,
  Error as ErrorIcon,
  FileUpload,
  Article,
} from '@openedx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';

import ErrorAlert from '../../../editors/sharedComponents/ErrorAlerts/ErrorAlert';
import { getLanguages, getSortedTranscripts } from '../data/utils';
import Transcript from './transcript-item';
import LanguageSelect from './transcript-item/LanguageSelect';
import { FileInput, useFileInput } from '../../generic';
import {
  deleteVideoTranscript,
  downloadVideoTranscript,
  resetErrors,
  uploadVideoTranscript,
} from '../data/thunks';
import { RequestStatus } from '../../../data/constants';
import messages from './messages';
import { isValidSrt } from '../transcript-editor/srtUtils';

const TranscriptTab = ({
  video,
}) => {
  const intl = useIntl();
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
  const languages = useMemo(
    () => getLanguages(transcriptAvailableLanguages),
    [transcriptAvailableLanguages],
  );
  let sortedTranscripts = getSortedTranscripts(languages, transcripts);
  const [previousSelection, setPreviousSelection] = useState(sortedTranscripts);
  const [isAddingTranscript, setIsAddingTranscript] = useState(false);
  const [newLanguage, setNewLanguage] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [pendingFileName, setPendingFileName] = useState('');
  const [isSubmittingNewTranscript, setIsSubmittingNewTranscript] = useState(false);
  const [isSubmittingReplace, setIsSubmittingReplace] = useState(false);
  const [showAddTranscriptError, setShowAddTranscriptError] = useState(false);
  const [showAddedToast, setShowAddedToast] = useState(false);
  const [invalidSrtFile, setInvalidSrtFile] = useState(false);

  const addTranscriptFileInput = useFileInput({
    onAddFile: (files) => {
      const [file] = files;
      if (!file) {
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        if (!isValidSrt(e.target.result)) {
          setInvalidSrtFile(true);
          setSelectedFile(null);
        } else {
          setInvalidSrtFile(false);
          setSelectedFile(file);
          setShowAddTranscriptError(false);
        }
      };
      reader.readAsText(file);
    },
    setSelectedRows: () => {},
    setAddOpen: () => {},
  });

  useEffect(() => {
    dispatch(resetErrors({ errorType: 'transcript' }));
    sortedTranscripts = getSortedTranscripts(languages, transcripts);
    setPreviousSelection(sortedTranscripts);
  }, [transcripts]);

  useEffect(() => {
    if (isAddingTranscript) {
      const firstAvailableLanguage = Object.keys(languages).find((lang) => !previousSelection.includes(lang));
      setNewLanguage(firstAvailableLanguage || '');
      setSelectedFile(null);
    }
  }, [isAddingTranscript]);

  useEffect(() => {
    if (!isAddingTranscript || !isSubmittingNewTranscript) {
      return;
    }

    if (transcriptStatus === RequestStatus.SUCCESSFUL) {
      setIsSubmittingNewTranscript(false);
      setPendingFileName('');
      setIsAddingTranscript(false);
      setSelectedFile(null);
      setShowAddTranscriptError(false);
      setShowAddedToast(true);
    }

    if (transcriptStatus === RequestStatus.FAILED) {
      setIsSubmittingNewTranscript(false);
      setPendingFileName('');
      setSelectedFile(null);
      setShowAddTranscriptError(true);
    }
  }, [isAddingTranscript, isSubmittingNewTranscript, transcriptStatus]);

  useEffect(() => {
    if (!isSubmittingReplace) {
      return;
    }
    if (transcriptStatus === RequestStatus.SUCCESSFUL) {
      setIsSubmittingReplace(false);
      setShowAddedToast(true);
    }
    if (transcriptStatus === RequestStatus.FAILED) {
      setIsSubmittingReplace(false);
    }
  }, [isSubmittingReplace, transcriptStatus]);

  const handleTranscript = (data, actionType) => {
    const {
      language,
      newLanguage: transcriptNewLanguage,
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
        if (!isEmpty(language)) {
          setIsSubmittingReplace(true);
        }
        dispatch(uploadVideoTranscript({
          language,
          videoId: id,
          apiUrl: transcriptUploadHandlerUrl,
          newLanguage: transcriptNewLanguage,
          file,
          transcripts,
        }));
        break;
      default:
        break;
    }
  };

  const availableLanguages = Object.entries(languages)
    .filter(([lang]) => !previousSelection.includes(lang));

  const handleSubmitNewTranscript = () => {
    if (!newLanguage || !selectedFile) {
      return;
    }
    setShowAddTranscriptError(false);
    setIsSubmittingNewTranscript(true);
    setPendingFileName(selectedFile.name);
    handleTranscript({
      language: '',
      newLanguage,
      file: selectedFile,
    }, 'upload');
  };

  return (
    <Stack gap={3}>
      <div ref={divRef} style={{ overflowY: 'auto' }} className="px-1 py-2">
        <ErrorAlert
          hideHeading={false}
          isError={!isAddingTranscript && transcriptStatus === RequestStatus.FAILED && !isEmpty(errors.transcript)}
        >
          <ul className="p-0">
            {errors.transcript.map(message => (
              <li key={`transcript-error-${message}`} style={{ listStyle: 'none' }}>
                {intl.formatMessage(messages.errorAlertMessage, { message })}
              </li>
            ))}
          </ul>
        </ErrorAlert>
        {isAddingTranscript ? (
          <Stack gap={3}>
            <div className="h4 mb-0">{intl.formatMessage(messages.newTranscriptTitle)}</div>

            <div>
              <LanguageSelect
                options={languages}
                value={newLanguage}
                placeholderText={intl.formatMessage(messages.languageSelectPlaceholder)}
                previousSelection={previousSelection}
                className="col-12 p-0"
                handleSelect={(lang) => {
                  setNewLanguage(lang);
                  setShowAddTranscriptError(false);
                }}
              />
            </div>

            {!selectedFile && !isSubmittingNewTranscript && (
              <Button
                variant="outline-primary"
                iconBefore={FileUpload}
                className="justify-content-center w-100 mb-0 transcript-upload-button"
                onClick={addTranscriptFileInput.click}
              >
                {intl.formatMessage(messages.uploadFileLabel)}
              </Button>
            )}

            {isSubmittingNewTranscript ? (
              <Stack direction="horizontal" className="align-items-center text-gray-700 py-1">
                <Spinner animation="border" size="sm" className="mr-2" />
                <span className="small">{pendingFileName}</span>
              </Stack>
            ) : null}

            {selectedFile && !isSubmittingNewTranscript ? (
              <Stack
                direction="horizontal"
                className="align-items-center justify-content-between rounded py-1 transcript-tab__file-row"
              >
                <Stack direction="horizontal" gap={2} className="align-items-center text-gray-700 overflow-hidden transcript-tab__file-name-wrap">
                  <Icon src={Article} size="sm" className="flex-shrink-0" />
                  <span className="text-truncate transcript-tab__file-name">{selectedFile.name}</span>
                </Stack>
                <IconButton
                  src={Delete}
                  iconAs={Icon}
                  alt={intl.formatMessage(messages.removeSelectedFileLabel)}
                  onClick={() => setSelectedFile(null)}
                  className="flex-shrink-0"
                />
              </Stack>
            ) : null}

            {showAddTranscriptError && (
              <Stack direction="horizontal" gap={2} className="align-items-center text-danger-500">
                <Icon src={ErrorIcon} size="xs" />
                <span>{intl.formatMessage(messages.addTranscriptFailedLabel)}</span>
              </Stack>
            )}

            {invalidSrtFile && (
              <Stack direction="horizontal" gap={2} className="align-items-center text-danger-500">
                <Icon src={ErrorIcon} size="xs" />
                <span>{intl.formatMessage(messages.invalidSrtFormat)}</span>
              </Stack>
            )}

            {!selectedFile && (
              <div className="small text-gray-500">{intl.formatMessage(messages.uploadHelpText)}</div>
            )}

            <Stack direction="horizontal" gap={3} className="justify-content-end">
              <Button
                variant="tertiary"
                disabled={isSubmittingNewTranscript}
                onClick={() => {
                  setIsAddingTranscript(false);
                  setSelectedFile(null);
                  setPendingFileName('');
                  setIsSubmittingNewTranscript(false);
                  setShowAddTranscriptError(false);
                  setInvalidSrtFile(false);
                }}
              >
                {intl.formatMessage(messages.cancelButtonLabel)}
              </Button>
              <Button
                disabled={!selectedFile || !newLanguage || isSubmittingNewTranscript}
                onClick={handleSubmitNewTranscript}
              >
                {intl.formatMessage(messages.addTranscriptButtonLabel)}
              </Button>
            </Stack>

            <FileInput
              key="new-transcript-input"
              fileInput={addTranscriptFileInput}
              supportedFileFormats={['.srt']}
              allowMultiple={false}
            />
          </Stack>
        ) : (
          <>
            {previousSelection.map(transcript => (
              <Transcript
                {...{
                  languages,
                  transcript,
                  previousSelection,
                  handleTranscript,
                  video,
                  transcriptSettings: videoTranscriptSettings,
                }}
              />
            ))}
          </>
        )}
      </div>
      {!isAddingTranscript && (
      <div className="border-top border-light-400">
        <Button
          variant="link"
          iconBefore={Add}
          size="sm"
          className="text-primary-500 justify-content-start pl-0 pt-3"
          onClick={() => setIsAddingTranscript(true)}
          disabled={availableLanguages.length === 0}
        >
          {intl.formatMessage(messages.uploadButtonLabel)}
        </Button>
      </div>
      )}
      <Toast show={showAddedToast} onClose={() => setShowAddedToast(false)}>
        <Stack direction="horizontal" gap={2} className="align-items-center">
          <Icon src={CheckCircle} className="text-success" />
          <span>{intl.formatMessage(messages.newTranscriptAddedLabel)}</span>
        </Stack>
      </Toast>
    </Stack>
  );
};

TranscriptTab.propTypes = {
  video: PropTypes.shape({
    transcripts: PropTypes.arrayOf(PropTypes.string).isRequired,
    id: PropTypes.string.isRequired,
    displayName: PropTypes.string.isRequired,
  }).isRequired,
};

export default TranscriptTab;
