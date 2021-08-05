import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import PropTypes from 'prop-types';
import React from 'react';
import AppSettingsModal from '../app-settings-modal/AppSettingsModal';

import messages from './messages';

function CalculatorSettings({ intl, onClose }) {
  return (
    <AppSettingsModal
      appId="calculator"
      title={intl.formatMessage(messages.heading)}
      enableAppHelp={intl.formatMessage(messages.enableCalculatorHelp)}
      enableAppLabel={intl.formatMessage(messages.enableCalculatorLabel)}
      learnMoreText={intl.formatMessage(messages.enableCalculatorLink)}
      onClose={onClose}
    />
  );
}

CalculatorSettings.propTypes = {
  intl: intlShape.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default injectIntl(CalculatorSettings);
