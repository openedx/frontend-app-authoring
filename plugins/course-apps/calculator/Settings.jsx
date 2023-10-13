import React from 'react';

import { useIntl } from '@edx/frontend-platform/i18n';

import AppSettingsModal from 'CourseAuthoring/pages-and-resources/app-settings-modal/AppSettingsModal';
import messages from './messages';

/**
 * Settings widget for the "calculator" Course App.
 * @param {{onClose: () => void}} props 
 * @returns 
 */
const CalculatorSettings = ({ onClose }) => {
  const intl = useIntl();
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
};

export default CalculatorSettings;
