import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  ActionRow,
  AlertModal,
  Button,
  Icon,
  IconButton,
  Stack,
  useToggle,
} from '@openedx/paragon';
import { DeleteOutline, Error as ErrorIcon } from '@openedx/paragon/icons';
import { injectIntl, FormattedMessage, intlShape } from '@edx/frontend-platform/i18n';
import { isEmpty } from 'lodash';
import LanguageSelect from './LanguageSelect';
import TranscriptMenu from './TranscriptMenu';
import messages from './messages';
import sidebarMessages from '../messages';
import { FileInput, useFileInput } from '../../../generic';
import TranscriptEditor from '../../transcript-editor';
import { isValidSrt } from '../../transcript-editor/srtUtils';

const Transcript = ({
  languages,
  transcript,
  previousSelection,
  handleTranscript,
  video,
  transcriptSettings,
  // injected
  intl,
}) => {
  const [isConfirmationOpen, openConfirmation, closeConfirmation] = useToggle();
  const [newLanguage, setNewLanguage] = useState(transcript);
  const [editorLanguage, setEditorLanguage] = useState('');
  const [invalidSrtFile, setInvalidSrtFile] = useState(false);
  const language = transcript;

  useEffect(() => {
    setNewLanguage(transcript);
  }, [transcript]);

  const input = useFileInput({
    onAddFile: (files) => {
      const [file] = files;
      if (!file) {
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        if (!isValidSrt(e.target.result)) {
          setInvalidSrtFile(true);
        } else {
          setInvalidSrtFile(false);
          handleTranscript({
            file,
            language,
            newLanguage,
          }, 'upload');
        }
      };
      reader.readAsText(file);
    },
    setSelectedRows: () => {},
    setAddOpen: () => {},
  });

  const updateLangauge = (selected) => {
    setNewLanguage(selected);
    if (isEmpty(language)) {
      input.click();
    }
  };

  return (
    <>
      <div
        className="row m-0 align-items-center justify-content-between"
        key={`transcript-${language}`}
        data-testid={`transcript-${language}`}
      >
        <LanguageSelect
          options={languages}
          value={newLanguage}
          placeholderText={intl.formatMessage(messages.languageSelectPlaceholder)}
          previousSelection={previousSelection}
          handleSelect={updateLangauge}
        />
        { transcript === '' ? (
          <IconButton
            iconAs={Icon}
            src={DeleteOutline}
            onClick={openConfirmation}
            alt="delete empty transcript"
          />
        ) : (
          <TranscriptMenu
            {...{
              language,
              newLanguage,
              setNewLanguage,
              handleTranscript,
              input,
              launchDeleteConfirmation: openConfirmation,
              onEdit: setEditorLanguage,
            }}
          />
        )}
      </div>
      {invalidSrtFile && (
        <Stack direction="horizontal" gap={2} className="align-items-center text-danger-500 mt-1">
          <Icon src={ErrorIcon} size="xs" />
          <span className="small">{intl.formatMessage(sidebarMessages.invalidSrtFormat)}</span>
        </Stack>
      )}
      <AlertModal
        title={<FormattedMessage {...messages.deleteConfirmationHeader} />}
        isOpen={isConfirmationOpen}
        onClose={closeConfirmation}
        footerNode={(
          <ActionRow>
            <Button size="sm" variant="tertiary" onClick={closeConfirmation}>
              <FormattedMessage {...messages.cancelDeleteLabel} />
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                handleTranscript({ language: transcript }, 'delete');
                closeConfirmation();
              }}
            >
              <FormattedMessage {...messages.confirmDeleteLabel} />
            </Button>
          </ActionRow>
        )}
      >
        <p><FormattedMessage {...messages.deleteConfirmationMessage} /></p>
      </AlertModal>
      <FileInput key="transcript-input" fileInput={input} supportedFileFormats={['.srt']} />
      <TranscriptEditor
        isOpen={Boolean(editorLanguage)}
        onClose={() => setEditorLanguage('')}
        video={video}
        language={editorLanguage}
        languages={languages}
        transcriptSettings={transcriptSettings}
      />
    </>
  );
};

Transcript.propTypes = {
  languages: PropTypes.shape({}).isRequired,
  transcript: PropTypes.string.isRequired,
  previousSelection: PropTypes.arrayOf(PropTypes.string).isRequired,
  handleTranscript: PropTypes.func.isRequired,
  video: PropTypes.shape({
    id: PropTypes.string.isRequired,
    displayName: PropTypes.string.isRequired,
    downloadLink: PropTypes.string,
  }).isRequired,
  transcriptSettings: PropTypes.shape({
    transcriptDownloadHandlerUrl: PropTypes.string.isRequired,
    transcriptUploadHandlerUrl: PropTypes.string.isRequired,
  }).isRequired,
  // injected
  intl: intlShape.isRequired,
};

export default injectIntl(Transcript);
