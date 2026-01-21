import PropTypes from 'prop-types';
import React from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';

import AppSettingsModal from 'CourseAuthoring/pages-and-resources/app-settings-modal/AppSettingsModal';
import messages from './messages';

const DatesSettings = ({ onClose }) => {
  const intl = useIntl();

  return (
    <AppSettingsModal
      appId="dates"
      title={intl.formatMessage(messages.heading)}
      enableAppHelp={intl.formatMessage(messages.enableAppHelp)}
      enableAppLabel={intl.formatMessage(messages.enableAppLabel)}
      learnMoreText={intl.formatMessage(messages.learnMore)}
      onClose={onClose}
      validationSchema={{}}
      initialValues={{}}
      onSettingsSave={async () => true}
    />
  );
};

DatesSettings.propTypes = {
  onClose: PropTypes.func.isRequired,
};

export default DatesSettings;
