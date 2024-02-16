import React from 'react';
import PropTypes from 'prop-types';
import { isEmpty } from 'lodash';
import { injectIntl, FormattedMessage, intlShape } from '@edx/frontend-platform/i18n';
import {
  Form,
  Icon,
  Stack,
  TransitionReplace,
} from '@openedx/paragon';
import { Check } from '@openedx/paragon/icons';
import FormDropdown from './FormDropdown';
import { getLanguageOptions } from '../data/utils';
import messages from './messages';

const ThreePlayMediaForm = ({
  hasTranscriptCredentials,
  data,
  setData,
  transcriptionPlan,
  // injected
  intl,
}) => {
  if (hasTranscriptCredentials) {
    const selectedLanguages = data.preferredLanguages ? data.preferredLanguages : [];
    const turnaroundOptions = transcriptionPlan.turnaround;
    const sourceLangaugeOptions = getLanguageOptions(
      Object.keys(transcriptionPlan.translations),
      transcriptionPlan.languages,
    );
    const languages = getLanguageOptions(
      transcriptionPlan.translations[data.videoSourceLanguage],
      transcriptionPlan.languages,
    );
    const allowMultiple = Object.keys(languages).length > 1;
    return (
      <Stack gap={1}>
        <Form.Group size="sm">
          <Form.Label className="h5">
            <FormattedMessage {...messages.threePlayMediaTurnaroundLabel} />
          </Form.Label>
          <FormDropdown
            value={data.threePlayTurnaround}
            options={turnaroundOptions}
            handleSelect={(value) => setData({ ...data, threePlayTurnaround: value })}
            placeholderText={intl.formatMessage(messages.threePlayMediaTurnaroundPlaceholder)}
          />
        </Form.Group>
        <Form.Group size="sm">
          <Form.Label className="h5">
            <FormattedMessage {...messages.threePlayMediaSourceLanguageLabel} />
          </Form.Label>
          <FormDropdown
            value={data.videoSourceLanguage}
            options={sourceLangaugeOptions}
            handleSelect={(value) => setData({ ...data, videoSourceLanguage: value, preferredLanguages: [] })}
            placeholderText={intl.formatMessage(messages.threePlayMediaSourceLanguagePlaceholder)}
          />
        </Form.Group>
        <TransitionReplace>
          {!isEmpty(data.videoSourceLanguage) ? (
            <Form.Group size="sm">
              <Form.Label className="h5">
                <FormattedMessage {...messages.threePlayMediaTranscriptLanguageLabel} />
              </Form.Label>
              <FormDropdown
                value={selectedLanguages}
                options={languages}
                allowMultiple={allowMultiple}
                handleSelect={(value) => {
                  if (!allowMultiple) {
                    setData({ ...data, preferredLanguages: [value] });
                  } else {
                    const [lang, checked] = value;
                    if (checked) {
                      setData({ ...data, preferredLanguages: [...selectedLanguages, lang] });
                    } else {
                      const updatedLangList = selectedLanguages.filter((selected) => selected !== lang);
                      setData({ ...data, preferredLanguages: updatedLangList });
                    }
                  }
                }}
                placeholderText={intl.formatMessage(messages.threePlayMediaTranscriptLanguagePlaceholder)}
              />
              <Form.Control.Feedback>
                <ul className="m-0 p-0">
                  {selectedLanguages.map(language => (
                    <li className="row align-items-center m-0 pt-2" key={language}>
                      <Icon src={Check} size="xs" /> <span>{languages[language]}</span>
                    </li>
                  ))}
                </ul>
              </Form.Control.Feedback>
            </Form.Group>
          ) : null }
        </TransitionReplace>
      </Stack>
    );
  }
  return (
    <Stack gap={1}>
      <div className="small" data-testid="threePlayMediaCredentialMessage">
        <FormattedMessage {...messages.threePlayMediaCredentialMessage} />
      </div>
      <Form.Group size="sm">
        <Form.Label className="h5">
          <FormattedMessage {...messages.threePlayMediaApiKeyLabel} />
        </Form.Label>
        <Form.Control onBlur={(e) => setData({ ...data, apiKey: e.target.value })} />
      </Form.Group>
      <Form.Group size="sm">
        <Form.Label className="h5">
          <FormattedMessage {...messages.threePlayMediaApiSecretLabel} />
        </Form.Label>
        <Form.Control onBlur={(e) => setData({ ...data, apiSecretKey: e.target.value })} />
      </Form.Group>
    </Stack>
  );
};

ThreePlayMediaForm.propTypes = {
  hasTranscriptCredentials: PropTypes.bool.isRequired,
  data: PropTypes.shape({
    apiKey: PropTypes.string,
    apiSecretKey: PropTypes.string,
    threePlayTurnaround: PropTypes.string,
    preferredLanguages: PropTypes.arrayOf(PropTypes.string),
    videoSourceLanguage: PropTypes.string,
  }).isRequired,
  setData: PropTypes.func.isRequired,
  transcriptionPlan: PropTypes.shape({
    turnaround: PropTypes.shape({}),
    translations: PropTypes.shape({}),
    languages: PropTypes.shape({}),
  }).isRequired,
  // injected
  intl: intlShape.isRequired,
};

export default injectIntl(ThreePlayMediaForm);
