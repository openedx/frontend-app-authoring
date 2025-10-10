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
import { useIntl } from '@edx/frontend-platform/i18n';
import { getLanguageName } from '@src/editors/data/constants/video';
import { thunkActions, selectors } from '../../../../../../data/redux';
import { FileInput, fileInput } from '../../../../../../sharedComponents/FileInput';
import messages from './messages';

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
  openLanguages, // Only allow those languages not already associated with a transcript to be selected
}) => {
  const intl = useIntl();
  const dispatch = useDispatch();

  const [localLang, setLocalLang] = React.useState(language);
  const input = fileInput({ onAddFile: hooks.addFileCallback({ dispatch, localLang }) });
  const onLanguageChange = hooks.onSelectLanguage({
    dispatch, languageBeforeChange: localLang, setLocalLang, triggerupload: input.click,
  });

  const getTitle = () => {
    if (language) {
      return (
        <ActionRow>
          {getLanguageName(language)}
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
      <Dropdown className="w-100 mb-2">
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
          {openLanguages.map(lang => {
            const name = getLanguageName(lang);

            if (language === lang) {
              return (
                <Dropdown.Item key={lang}>
                  {name}
                  <Icon className="text-primary-500" src={Check} />
                </Dropdown.Item>
              );
            }
            return (
              <Dropdown.Item
                key={lang}
                onClick={() => onLanguageChange({ newLang: lang })}
              >
                {name}
              </Dropdown.Item>
            );
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
};

export const mapStateToProps = (state) => ({
  openLanguages: selectors.video.openLanguages(state),
});

export const mapDispatchToProps = {};

export const LanguageSelectorInternal = LanguageSelector; // For testing only
export default connect(mapStateToProps, mapDispatchToProps)(LanguageSelector);
