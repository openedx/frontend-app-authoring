import React from 'react';
import PropTypes from 'prop-types';

import {
  Form,
} from '@edx/paragon';
import { connect, useDispatch } from 'react-redux';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import hooks from './hooks';
import { selectors } from '../../../../../../data/redux';
import { videoTranscriptLanguages } from '../../../../../../data/constants/video';
import messages from './messages';

export const LanguageSelect = ({
  title, // For a unique id for the form control
  language,
  // Redux
  openLanguages, // Only allow those languages not already associated with a transcript to be selected
  transcripts,
  // intl
  intl,

}) => {
  const onLanguageChange = hooks.onSelectLanguage({
    filename: title, dispatch: useDispatch(), transcripts, languageBeforeChange: language,
  });

  return (
    <Form.Group controlId={`selectLanguage-form-${title}`} className="mt-2 mx-2">
      <Form.Control as="select" defaultValue={language} onChange={(e) => onLanguageChange(e)} floatingLabel={intl.formatMessage(messages.languageSelectLabel)}>
        {Object.entries(videoTranscriptLanguages).map(([lang, text]) => {
          if (language === lang) { return (<option value={lang} selected>{text}</option>); }
          if (openLanguages.some(row => row.includes(lang))) {
            return (<option value={lang}>{text}</option>);
          }
          return (<option value={lang} disabled>{text}</option>);
        })}
      </Form.Control>
    </Form.Group>
  );
};

LanguageSelect.defaultProps = {
  openLanguages: [],
};

LanguageSelect.propTypes = {
  openLanguages: PropTypes.arrayOf(PropTypes.string),
  title: PropTypes.string.isRequired,
  language: PropTypes.string.isRequired,
  transcripts: PropTypes.objectOf(PropTypes.string).isRequired,
  intl: intlShape.isRequired,
};

export const mapStateToProps = (state) => ({
  openLanguages: selectors.video.openLanguages(state),
  transcripts: selectors.video.transcripts(state),
});

export const mapDispatchToProps = {};

export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(LanguageSelect));
