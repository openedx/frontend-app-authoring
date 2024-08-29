import React from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FormattedMessage, injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Form, Hyperlink } from '@openedx/paragon';
import { selectors } from '../../../../../../data/redux';
import SettingsOption from '../SettingsOption';
import messages from '../messages';
import { scoringCardHooks } from '../hooks';

const ScoringCard = ({
  scoring,
  defaultValue,
  updateSettings,
  // inject
  intl,
  // redux
  studioEndpointUrl,
  learningContextId,
  isLibrary,
}) => {
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
          disabled={!_.isNil(defaultValue)}
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
  intl: intlShape.isRequired,
  // eslint-disable-next-line
  scoring: PropTypes.any.isRequired,
  updateSettings: PropTypes.func.isRequired,
  defaultValue: PropTypes.number,
  // redux
  studioEndpointUrl: PropTypes.string.isRequired,
  learningContextId: PropTypes.string,
  isLibrary: PropTypes.bool.isRequired,
};

ScoringCard.defaultProps = {
  learningContextId: null,
  defaultValue: null,
};

export const mapStateToProps = (state) => ({
  studioEndpointUrl: selectors.app.studioEndpointUrl(state),
  learningContextId: selectors.app.learningContextId(state),
  isLibrary: selectors.app.isLibrary(state),
});

export const mapDispatchToProps = {};

export const ScoringCardInternal = ScoringCard; // For testing only
export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(ScoringCard));
