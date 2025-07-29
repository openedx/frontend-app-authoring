import React from 'react';
import isNil from 'lodash/isNil';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import { Form, Hyperlink } from '@openedx/paragon';
import { selectors } from '../../../../../../data/redux';
import SettingsOption from '../SettingsOption';
import messages from '../messages';
import { scoringCardHooks } from '../hooks';

const ScoringCard = ({
  scoring,
  defaultValue,
  updateSettings,
}) => {
  const intl = useIntl();

  const studioEndpointUrl = useSelector(selectors.app.studioEndpointUrl);
  const learningContextId = useSelector(selectors.app.learningContextId);
  const isLibrary = useSelector(selectors.app.isLibrary);

  const {
    handleUnlimitedChange,
    handleMaxAttemptChange,
    handleWeightChange,
    handleOnChange,
    attemptDisplayValue,
  } = scoringCardHooks(scoring, updateSettings, defaultValue);

  const getScoringSummary = (weight, attempts, unlimited) => {
    let summary = intl.formatMessage(messages.weightSummary, { weight });
    summary += ` ${String.fromCharCode(183)} `;
    summary += unlimited
      ? intl.formatMessage(messages.unlimitedAttemptsSummary)
      : intl.formatMessage(messages.attemptsSummary, { attempts: attempts || defaultValue });
    return summary;
  };

  return (
    <SettingsOption
      title={intl.formatMessage(messages.scoringSettingsTitle)}
      summary={getScoringSummary(scoring.weight, scoring.attempts.number, scoring.attempts.unlimited)}
      className="scoringCard"
    >
      <div className="mb-4">
        <FormattedMessage {...messages.scoringSettingsLabel} />
      </div>
      <Form.Group>
        <Form.Control
          type="number"
          min={0}
          step={0.1}
          value={scoring.weight}
          onChange={handleWeightChange}
          floatingLabel={intl.formatMessage(messages.scoringWeightInputLabel)}
        />
        <Form.Control.Feedback>
          <FormattedMessage {...messages.weightHint} />
        </Form.Control.Feedback>
      </Form.Group>
      <Form.Group>
        <Form.Control
          type="number"
          min={0}
          value={attemptDisplayValue}
          onChange={handleOnChange}
          onBlur={handleMaxAttemptChange}
          floatingLabel={intl.formatMessage(messages.scoringAttemptsInputLabel)}
          disabled={scoring.attempts.unlimited}
        />
        <Form.Control.Feedback>
          <FormattedMessage {...messages.attemptsHint} />
        </Form.Control.Feedback>
        <Form.Checkbox
          className="mt-3 decoration-control-label"
          checked={scoring.attempts.unlimited}
          onChange={handleUnlimitedChange}
          disabled={!isNil(defaultValue)}
        >
          <div className="x-small">
            <FormattedMessage {...messages.unlimitedAttemptsCheckboxLabel} />
          </div>
        </Form.Checkbox>
      </Form.Group>
      {!isLibrary && (
        <Hyperlink destination={`${studioEndpointUrl}/settings/advanced/${learningContextId}#max_attempts`} target="_blank">
          <FormattedMessage {...messages.advancedSettingsLinkText} />
        </Hyperlink>
      )}
    </SettingsOption>
  );
};

ScoringCard.propTypes = {
  scoring: PropTypes.shape({
    weight: PropTypes.number.isRequired,
    attempts: PropTypes.shape({
      number: PropTypes.number,
      unlimited: PropTypes.bool.isRequired,
    }).isRequired,
  }).isRequired,
  updateSettings: PropTypes.func.isRequired,
  defaultValue: PropTypes.number,
};

ScoringCard.defaultProps = {
  defaultValue: null,
};

export default ScoringCard;
