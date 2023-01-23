import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Form } from '@edx/paragon';
import SettingsOption from '../SettingsOption';
import messages from '../messages';
import { scoringCardHooks } from '../hooks';

export const ScoringCard = ({
  scoring,
  updateSettings,
  // inject
  intl,
}) => {
  const { handleMaxAttemptChange, handleWeightChange } = scoringCardHooks(scoring, updateSettings);

  const getScoringSummary = (attempts, unlimited, weight) => {
    let summary = unlimited
      ? intl.formatMessage(messages.unlimitedAttemptsSummary)
      : intl.formatMessage(messages.attemptsSummary, { attempts });
    summary += ` ${String.fromCharCode(183)} `;
    summary += intl.formatMessage(messages.weightSummary, { weight });
    return summary;
  };

  return (
    <SettingsOption
      title={intl.formatMessage(messages.scoringSettingsTitle)}
      summary={getScoringSummary(scoring.attempts.number, scoring.attempts.unlimited, scoring.weight)}
    >
      <Form.Label className="mb-4">
        <FormattedMessage {...messages.scoringSettingsLabel} />
      </Form.Label>
      <Form.Group>
        <Form.Control
          type="number"
          value={scoring.attempts.number}
          onChange={handleMaxAttemptChange}
          floatingLabel={intl.formatMessage(messages.scoringAttemptsInputLabel)}
        />
        <Form.Control.Feedback>
          <FormattedMessage {...messages.attemptsHint} />
        </Form.Control.Feedback>
      </Form.Group>
      <Form.Group>
        <Form.Control
          type="number"
          value={scoring.weight}
          onChange={handleWeightChange}
          floatingLabel={intl.formatMessage(messages.scoringWeightInputLabel)}
        />
        <Form.Control.Feedback>
          <FormattedMessage {...messages.weightHint} />
        </Form.Control.Feedback>
      </Form.Group>
    </SettingsOption>
  );
};

ScoringCard.propTypes = {
  intl: intlShape.isRequired,
  // eslint-disable-next-line
  scoring: PropTypes.any.isRequired,
  updateSettings: PropTypes.func.isRequired,
};

export default injectIntl(ScoringCard);
