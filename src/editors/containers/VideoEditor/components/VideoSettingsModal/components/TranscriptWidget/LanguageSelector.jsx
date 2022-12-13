import React from 'react';
import PropTypes from 'prop-types';

import {
  Form,
} from '@edx/paragon';
import { connect, useDispatch } from 'react-redux';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { thunkActions, selectors } from '../../../../../../data/redux';
import { videoTranscriptLanguages } from '../../../../../../data/constants/video';
import { FileInput, fileInput } from '../../../../../../sharedComponents/FileInput';
import messages from './messages';
import * as module from './LanguageSelector';

export const hooks = {
  onSelectLanguage: ({
    dispatch, languageBeforeChange, triggerupload, setLocalLang,
  }) => (event) => {
    // IF Language is unset, set language and begin upload prompt.
    setLocalLang(event.target.value);
    if (languageBeforeChange === '') {
      triggerupload();
      return;
    }
    // Else: update language
    dispatch(
      thunkActions.video.updateTranscriptLanguage({
        newLanguageCode: event.target.value, languageBeforeChange,
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

export const LanguageSelector = ({
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
  return (
    <div className="col col-11 p-0">
      <Form.Group controlId={`selectLanguage-form-${index}`} className="mw-100  m-0">
        <Form.Control
          as="select"
          aria-label={intl.formatMessage(messages.languageSelectLabel)}
          defaultValue={language}
          onChange={(e) => onLanguageChange(e)}
        >
          {Object.entries(videoTranscriptLanguages).map(([lang, text]) => {
            if (language === lang) { return (<option value={lang} selected>{text}</option>); }
            if (lang === 'placeholder') { return (<option hidden>{intl.formatMessage(messages.languageSelectPlaceholder)}</option>); }
            if (openLanguages.some(row => row.includes(lang))) {
              return (<option value={lang}>{text}</option>);
            }
            return (<option value={lang} disabled>{text}</option>);
          })}
        </Form.Control>
      </Form.Group>
      <FileInput fileInput={input} acceptedFiles=".srt" />
    </div>
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

export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(LanguageSelector));
