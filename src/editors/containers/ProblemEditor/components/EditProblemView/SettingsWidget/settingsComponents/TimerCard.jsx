import React from 'react';
import { injectIntl, FormattedMessage, intlShape } from '@edx/frontend-platform/i18n';
import { Form } from '@openedx/paragon';
import PropTypes from 'prop-types';
import SettingsOption from '../SettingsOption';
import messages from '../messages';
import { timerCardHooks } from '../hooks';

const TimerCard = ({
  timeBetween,
  updateSettings,
  // inject
  intl,
}) => {
  const { handleChange } = timerCardHooks(updateSettings);

  return (
    <SettingsOption
      title={intl.formatMessage(messages.timerSettingsTitle)}
      summary={intl.formatMessage(messages.timerSummary, { time: timeBetween })}
    >
      <div className="spacedMessage">
        <span>
          <FormattedMessage {...messages.timerSettingText} />
        </span>
      </div>
      <Form.Group>
        <Form.Control
          type="number"
          min={0}
          value={timeBetween}
          onChange={handleChange}
          floatingLabel={intl.formatMessage(messages.timerInputLabel)}
        />
      </Form.Group>
    </SettingsOption>
  );
};

TimerCard.propTypes = {
  timeBetween: PropTypes.number.isRequired,
  updateSettings: PropTypes.func.isRequired,
  intl: intlShape.isRequired,
};

export const TimerCardInternal = TimerCard; // For testing only
export default injectIntl(TimerCard);
