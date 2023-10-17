import React from 'react';
import PropTypes from 'prop-types';
import { isEmpty } from 'lodash';
import { Form, Stack, TransitionReplace } from '@edx/paragon';
import FormDropdown from './FormDropdown';
import { getFidelityOptions } from '../data/utils';

const Cielo24Form = ({
  hasTranscriptCredentials,
  data,
  setData,
  transcriptionPlan,
}) => {
  const { fidelity } = transcriptionPlan;
  const selectedLanguage = data.preferredLanguages ? data.preferredLanguages : '';
  const turnaroundOptions = transcriptionPlan.turnaround;
  const fidelityOptions = getFidelityOptions(fidelity);
  const sourceLanguageOptions = data.cieloFidelity ? fidelity[data.cieloFidelity]?.languages : {};
  const languages = data.cieloFidelity === 'PROFESSIONAL' ? sourceLanguageOptions : {
    [data.videoSourceLanguage]: sourceLanguageOptions[data.videoSourceLanguage],
  };

  if (hasTranscriptCredentials) {
    return (
      <Stack gap={1}>
        <Form.Group size="sm">
          <Form.Label className="h5">
            Transcript turnaround
          </Form.Label>
          <FormDropdown
            value={data.cieloTurnaround}
            options={turnaroundOptions}
            handleSelect={(value) => setData({ ...data, cieloTurnaround: value })}
            placeholderText="Select turnaround"
          />
        </Form.Group>
        <Form.Group size="sm">
          <Form.Label className="h5">
            Transcript fidelity
          </Form.Label>
          <FormDropdown
            value={data.cieloFidelity}
            options={fidelityOptions}
            handleSelect={(value) => setData({ ...data, cieloFidelity: value, videoSourceLanguage: '' })}
            placeholderText="Select fidelity"
          />
        </Form.Group>
        <TransitionReplace>
          {isEmpty(data.cieloFidelity) ? null : (
            <Form.Group size="sm">
              <Form.Label className="h5">
                Video Source Language
              </Form.Label>
              <FormDropdown
                value={data.videoSourceLanguage}
                options={sourceLanguageOptions}
                handleSelect={(value) => setData({ ...data, videoSourceLanguage: value, preferredLanguages: '' })}
                placeholderText="Select language"
              />
            </Form.Group>
          )}
        </TransitionReplace>
        <TransitionReplace>
          {isEmpty(data.videoSourceLanguage) ? null : (
            <Form.Group size="sm">
              <Form.Label className="h5">
                Transcript language
              </Form.Label>
              <FormDropdown
                value={selectedLanguage}
                options={languages}
                handleSelect={(value) => setData({ ...data, preferredLanguages: [value] })}
                placeholderText="Select language"
              />
            </Form.Group>
          )}
        </TransitionReplace>
      </Stack>
    );
  }

  return (
    <Stack gap={1}>
      <div className="small">
        Enter the account information for your organization.
      </div>
      <Form.Group size="sm">
        <Form.Label className="h5">
          API Key
        </Form.Label>
        <Form.Control onBlur={(e) => setData({ ...data, apiKey: e.target.value })} />
      </Form.Group>
      <Form.Group size="sm">
        <Form.Label className="h5">
          Username
        </Form.Label>
        <Form.Control onBlur={(e) => setData({ ...data, username: e.target.value })} />
      </Form.Group>
    </Stack>
  );
};

Cielo24Form.propTypes = {
  hasTranscriptCredentials: PropTypes.bool.isRequired,
  data: PropTypes.shape({
    apiKey: PropTypes.string,
    apiSecretKey: PropTypes.string,
    cieloTurnaround: PropTypes.string,
    cieloFidelity: PropTypes.string,
    preferredLanguages: PropTypes.arrayOf(PropTypes.string),
    videoSourceLanguage: PropTypes.string,
  }).isRequired,
  setData: PropTypes.func.isRequired,
  transcriptionPlan: PropTypes.shape({
    turnaround: PropTypes.shape({}),
    fidelity: PropTypes.shape({}),
  }).isRequired,
};

export default Cielo24Form;
