import React from 'react';
import PropTypes from 'prop-types';

import {
  ActionRow,
  Dropdown,
  Button,
  Icon,
} from '@openedx/paragon';

import { Check } from '@openedx/paragon/icons';
import { connect, useDispatch } from 'react-redux';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { thunkActions, selectors } from '../../../../../../data/redux';
import { videoTranscriptLanguages } from '../../../../../../data/constants/video';
import { FileInput, fileInput } from '../../../../../../sharedComponents/FileInput';
import messages from './messages';
// This 'module' self-import hack enables mocking during tests.
// See src/editors/decisions/0005-internal-editor-testability-decisions.md. The whole approach to how hooks are tested
// should be re-thought and cleaned up to avoid this pattern.
// eslint-disable-next-line import/no-self-import
import * as module from './LanguageSelector';

export const hooks = {
  onSelectLanguage: ({
    dispatch, languageBeforeChange, triggerupload, setLocalLang,
  }) => ({ newLang }) => {
    // IF Language is unset, set language and begin upload prompt.
    setLocalLang(newLang);
    if (languageBeforeChange === '') {
      triggerupload();
      return;
    }
    // Else: update language
    dispatch(
      thunkActions.video.updateTranscriptLanguage({
        newLanguageCode: newLang, languageBeforeChange,
      }),
    );
  },

  addFileCallback: ({ dispatch, localLang }) => (file) => {
    dispatch(thunkActions.video.uploadTranscript({
      file,
      filename: file.name,
      language: localLang,
    }));
  },

};

const LanguageSelector = ({
  index, // For a unique id for the form control
  language,
  // Redux
  openLanguages, // Only allow those languages not already associated with a transcript to be selected
  // intl
  intl,

}) => {
  const [localLang, setLocalLang] = React.useState(language);
  const input = fileInput({ onAddFile: hooks.addFileCallback({ dispatch: useDispatch(), localLang }) });
  const onLanguageChange = module.hooks.onSelectLanguage({
    dispatch: useDispatch(), languageBeforeChange: localLang, setLocalLang, triggerupload: input.click,
  });

  const getTitle = () => {
    if (Object.prototype.hasOwnProperty.call(videoTranscriptLanguages, language)) {
      return (
        <ActionRow>
          {videoTranscriptLanguages[language]}
          <ActionRow.Spacer />
          <Icon className="text-primary-500" src={Check} />
        </ActionRow>

      );
    }
    return (
      <ActionRow>
        {intl.formatMessage(messages.languageSelectPlaceholder)}
        <ActionRow.Spacer />
      </ActionRow>
    );
  };

  return (
    <>

      <Dropdown
        className="w-100 mb-2"
      >
        <Dropdown.Toggle
          iconAs={Button}
          aria-label={intl.formatMessage(messages.languageSelectLabel)}
          block
          id={`selectLanguage-form-${index}`}
          className="w-100"
          variant="outline-primary"
        >
          {getTitle()}
        </Dropdown.Toggle>
        <Dropdown.Menu>
          {Object.entries(videoTranscriptLanguages).map(([lang, text]) => {
            if (language === lang) {
              return (<Dropdown.Item>{text}<Icon className="text-primary-500" src={Check} /></Dropdown.Item>);
            }
            if (openLanguages.some(row => row.includes(lang))) {
              return (<Dropdown.Item onClick={() => onLanguageChange({ newLang: lang })}>{text}</Dropdown.Item>);
            }
            return (<Dropdown.Item className="disabled">{text}</Dropdown.Item>);
          })}
        </Dropdown.Menu>
      </Dropdown>
      <FileInput fileInput={input} acceptedFiles=".srt" />
    </>
  );
};

LanguageSelector.defaultProps = {
  openLanguages: [],
};

LanguageSelector.propTypes = {
  openLanguages: PropTypes.arrayOf(PropTypes.string),
  index: PropTypes.number.isRequired,
  language: PropTypes.string.isRequired,
  intl: intlShape.isRequired,
};

export const mapStateToProps = (state) => ({
  openLanguages: selectors.video.openLanguages(state),
});

export const mapDispatchToProps = {};

export const LanguageSelectorInternal = LanguageSelector; // For testing only
export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(LanguageSelector));
