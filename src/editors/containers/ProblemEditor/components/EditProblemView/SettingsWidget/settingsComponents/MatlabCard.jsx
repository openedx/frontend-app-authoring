import React from 'react';
import { injectIntl, FormattedMessage, intlShape } from '@edx/frontend-platform/i18n';
import { Form, MailtoLink } from '@edx/paragon';
import PropTypes from 'prop-types';
import SettingsOption from '../SettingsOption';
import messages from '../messages';
import { matlabCardHooks } from '../hooks';

export const MatlabCard = ({
  matLabApiKey,
  updateSettings,
  // inject
  intl,
}) => {
  const { summary, handleChange } = matlabCardHooks(matLabApiKey, updateSettings);

  return (
    <SettingsOption
      title={intl.formatMessage(messages.matlabSettingTitle)}
      summary={summary.intl ? intl.formatMessage(summary.message, { ...summary.values }) : summary.message}
      none={!matLabApiKey}
    >
      <div className="halfSpacedMessage">
        <span>
          <FormattedMessage {...messages.matlabSettingText1} />
        </span>
      </div>
      <div className="spacedMessage">
        <span>
          <FormattedMessage {...messages.matlabSettingText2} />&nbsp;
          <MailtoLink to="moocsupport@mathworks.com">
            moocsupport@mathworks.com
          </MailtoLink>
        </span>
      </div>
      <Form.Group>
        <Form.Control
          value={matLabApiKey}
          onChange={handleChange}
          floatingLabel={intl.formatMessage(messages.matlabInputLabel)}
        />
      </Form.Group>
    </SettingsOption>
  );
};

MatlabCard.propTypes = {
  matLabApiKey: PropTypes.string.isRequired,
  updateSettings: PropTypes.func.isRequired,
  intl: intlShape.isRequired,
};

export default injectIntl(MatlabCard);
