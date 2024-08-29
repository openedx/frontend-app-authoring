import React from 'react';
import { injectIntl, FormattedMessage, intlShape } from '@edx/frontend-platform/i18n';
import { Form } from '@openedx/paragon';
import PropTypes from 'prop-types';
import SettingsOption from '../../SettingsOption';
import messages from './messages';
import { generalFeedbackHooks } from './hooks';

export const GeneralFeedbackCard = ({
  generalFeedback,
  updateSettings,
  // inject
  intl,
}) => {
  const { summary, handleChange } = generalFeedbackHooks(generalFeedback, updateSettings);
  return (
    <SettingsOption
      title={intl.formatMessage(messages.generalFeebackSettingTitle)}
      summary={summary.intl ? intl.formatMessage(summary.message) : summary.message}
      none={!generalFeedback}
    >
      <div className="halfSpacedMessage">
        <span>
          <FormattedMessage {...messages.generalFeedbackDescription} />
        </span>
      </div>
      <Form.Group>
        <Form.Control
          value={generalFeedback}
          onChange={handleChange}
          floatingLabel={intl.formatMessage(messages.generalFeedbackInputLabel)}
        />
      </Form.Group>
    </SettingsOption>
  );
};

GeneralFeedbackCard.propTypes = {
  generalFeedback: PropTypes.string.isRequired,
  updateSettings: PropTypes.func.isRequired,
  intl: intlShape.isRequired,
};

export default injectIntl(GeneralFeedbackCard);
