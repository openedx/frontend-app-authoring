import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Card,
  Button,
  Icon,
  IconButton,
  useToggle,
} from '@openedx/paragon';
import { DeleteOutline } from '@openedx/paragon/icons';
import { injectIntl, FormattedMessage, intlShape } from '@edx/frontend-platform/i18n';
import { isEmpty } from 'lodash';
import LanguageSelect from './LanguageSelect';
import TranscriptMenu from './TranscriptMenu';
import messages from './messages';
import { FileInput, useFileInput } from '../../../generic';

const Transcript = ({
  languages,
  transcript,
  previousSelection,
  handleTranscript,
  // injected
  intl,
}) => {
  const [isConfirmationOpen, openConfirmation, closeConfirmation] = useToggle();
  const [newLanguage, setNewLanguage] = useState(transcript);
  const language = transcript;

  useEffect(() => {
    setNewLanguage(transcript);
  }, [transcript]);

  const input = useFileInput({
    onAddFile: (files) => {
      const [file] = files;
      handleTranscript({
        file,
        language,
        newLanguage,
      }, 'upload');
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
      {isConfirmationOpen ? (
        <Card className="my-2">
          <Card.Header className="h3" title={(<FormattedMessage {...messages.deleteConfirmationHeader} />)} />
          <Card.Body>
            <Card.Section>
              <FormattedMessage {...messages.deleteConfirmationMessage} />
            </Card.Section>
            <Card.Footer>
              <Button size="sm" variant="tertiary" className="mb-2 mb-sm-0" onClick={closeConfirmation}>
                <FormattedMessage {...messages.cancelDeleteLabel} />
              </Button>
              <Button
                variant="danger"
                className="mb-2 mb-sm-0"
                size="sm"
                onClick={() => {
                  handleTranscript({ language: transcript }, 'delete');
                  closeConfirmation();
                }}
              >
                <FormattedMessage {...messages.confirmDeleteLabel} />
              </Button>
            </Card.Footer>
          </Card.Body>
        </Card>
      ) : (
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
              }}
            />
          )}
        </div>
      )}
      <FileInput key="transcript-input" fileInput={input} supportedFileFormats={['.srt']} />
    </>
  );
};

Transcript.propTypes = {
  languages: PropTypes.shape({}).isRequired,
  transcript: PropTypes.string.isRequired,
  previousSelection: PropTypes.arrayOf(PropTypes.string).isRequired,
  handleTranscript: PropTypes.func.isRequired,
  // injected
  intl: intlShape.isRequired,
};

export default injectIntl(Transcript);
