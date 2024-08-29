import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  FormattedMessage,
  FormattedDate,
  injectIntl,
  intlShape,
} from '@edx/frontend-platform/i18n';
import { Button, Stack } from '@openedx/paragon';
import ErrorAlert from '../../../editors/sharedComponents/ErrorAlerts/ErrorAlert';
import SelectableBox from '../../../editors/sharedComponents/SelectableBox';
import Cielo24Form from './Cielo24Form';
import ThreePlayMediaForm from './ThreePlayMediaForm';
import { RequestStatus } from '../../../data/constants';
import messages from './messages';
import { checkCredentials, checkTranscriptionPlans, validateForm } from '../data/utils';

const OrderTranscriptForm = ({
  setTranscriptType,
  activeTranscriptPreferences,
  transcriptType,
  transcriptCredentials,
  closeTranscriptSettings,
  handleOrderTranscripts,
  transcriptionPlans,
  errorMessages,
  transcriptStatus,
  // injected
  intl,
}) => {
  const [data, setData] = useState(activeTranscriptPreferences || { videoSourceLanguage: '' });

  const [validCieloTranscriptionPlan, validThreePlayTranscriptionPlan] = checkTranscriptionPlans(transcriptionPlans);
  useEffect(() => {
    setTranscriptType(activeTranscriptPreferences?.provider || 'order');
  }, []);

  let [cieloHasCredentials, threePlayHasCredentials] = checkCredentials(transcriptCredentials);
  useEffect(() => {
    [cieloHasCredentials, threePlayHasCredentials] = checkCredentials(transcriptCredentials);
  }, [transcriptCredentials]);

  let isFormValid = validateForm(cieloHasCredentials, threePlayHasCredentials, transcriptType, data);
  useEffect(() => {
    isFormValid = validateForm(cieloHasCredentials, threePlayHasCredentials, transcriptType, data);
  }, [data]);

  const handleDiscard = () => {
    setTranscriptType(activeTranscriptPreferences?.provider);
    closeTranscriptSettings();
  };

  const handleUpdate = () => handleOrderTranscripts(data, transcriptType);

  let form;
  switch (transcriptType) {
    case 'Cielo24':
      form = (
        <Cielo24Form
          {...{
            hasTranscriptCredentials: cieloHasCredentials,
            data,
            setData,
            transcriptionPlan: transcriptionPlans.Cielo24,
          }}
        />
      );
      break;
    case '3PlayMedia':
      form = (
        <ThreePlayMediaForm
          {...{
            hasTranscriptCredentials: threePlayHasCredentials,
            data,
            setData,
            transcriptionPlan: transcriptionPlans['3PlayMedia'],
          }}
        />
      );
      break;
    default:
      break;
  }
  return (
    <>
      <ErrorAlert
        hideHeading={false}
        isError={!validCieloTranscriptionPlan && cieloHasCredentials}
      >
        <FormattedMessage {...messages.invalidCielo24TranscriptionPlanMessage} />
      </ErrorAlert>
      <ErrorAlert
        hideHeading={false}
        isError={!validThreePlayTranscriptionPlan && threePlayHasCredentials}
      >
        <FormattedMessage {...messages.invalid3PlayMediaTranscriptionPlanMessage} />
      </ErrorAlert>
      <ErrorAlert
        hideHeading={false}
        isError={transcriptStatus === RequestStatus.FAILED}
      >
        <ul className="p-0">
          {errorMessages.transcript.map(message => (
            <li key={`order-transcript-error-${message}`} style={{ listStyle: 'none' }}>
              {intl.formatMessage(messages.errorAlertMessage, { message })}
            </li>
          ))}
        </ul>
      </ErrorAlert>
      <SelectableBox.Set
        columns={1}
        value={transcriptType}
        name="transcriptProviders"
        ariaLabel="provider selection"
        className="my-3"
        onChange={(e) => {
          setTranscriptType(e.target.value);
        }}
      >
        <SelectableBox
          value="order"
          aria-label="none radio"
          className="text-center"
        >
          <FormattedMessage {...messages.noneLabel} />
        </SelectableBox>
        <SelectableBox
          value="Cielo24"
          aria-label="Cielo24 radio"
          className="text-center"
          disabled={!validCieloTranscriptionPlan && cieloHasCredentials}
        >
          <FormattedMessage {...messages.cieloLabel} />
        </SelectableBox>
        <SelectableBox
          value="3PlayMedia"
          aria-label="3PlayMedia radio"
          className="text-center"
          disabled={!validThreePlayTranscriptionPlan && threePlayHasCredentials}
        >
          <FormattedMessage {...messages.threePlayMediaLabel} />
        </SelectableBox>
      </SelectableBox.Set>
      {form}
      <Stack gap={3} className="mt-4">
        <Button onClick={handleUpdate} disabled={!isFormValid}>
          <FormattedMessage {...messages.updateSettingsLabel} />
        </Button>
        <Button variant="tertiary" onClick={handleDiscard}>
          <FormattedMessage {...messages.discardSettingsLabel} />
        </Button>
        {activeTranscriptPreferences?.modified && (
          <div className="row m-0 x-small">
            <div className="mr-1">
              <FormattedMessage {...messages.lastUpdatedMessage} />
            </div>
            <FormattedDate
              value={data.modified}
              year="numeric"
              month="long"
              day="2-digit"
            />
          </div>
        )}
      </Stack>
    </>
  );
};

OrderTranscriptForm.propTypes = {
  setTranscriptType: PropTypes.func.isRequired,
  activeTranscriptPreferences: PropTypes.shape({
    provider: PropTypes.string.isRequired,
    cielo24Turnaround: PropTypes.string,
    cielo24Fidelity: PropTypes.string,
    preferredLanguages: PropTypes.arrayOf(PropTypes.string),
    turnaround: PropTypes.string,
    videoSourceLanguage: PropTypes.string,
    modified: PropTypes.instanceOf(Date),
  }),
  transcriptType: PropTypes.string.isRequired,
  transcriptCredentials: PropTypes.shape({
    cielo24: PropTypes.bool.isRequired,
    '3PlayMedia': PropTypes.bool.isRequired,
  }).isRequired,
  closeTranscriptSettings: PropTypes.func.isRequired,
  transcriptStatus: PropTypes.string.isRequired,
  errorMessages: PropTypes.shape({
    transcript: PropTypes.arrayOf(PropTypes.string).isRequired,
  }).isRequired,
  handleOrderTranscripts: PropTypes.func.isRequired,
  transcriptionPlans: PropTypes.shape({
    Cielo24: PropTypes.shape({
      turnaround: PropTypes.shape({}),
      fidelity: PropTypes.shape({}),
    }).isRequired,
    '3PlayMedia': PropTypes.shape({
      turnaround: PropTypes.shape({}),
      translations: PropTypes.shape({}),
      languages: PropTypes.shape({}),
    }).isRequired,
  }).isRequired,
  // injected
  intl: intlShape.isRequired,
};

OrderTranscriptForm.defaultProps = {
  activeTranscriptPreferences: null,
};

export default injectIntl(OrderTranscriptForm);
