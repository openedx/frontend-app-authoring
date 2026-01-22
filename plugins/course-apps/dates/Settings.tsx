import React from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';

import AppSettingsModal from 'CourseAuthoring/pages-and-resources/app-settings-modal/AppSettingsModal';
import messages from './messages';

type DatesSettingsProps = {
  onClose: () => void;
};

const DatesSettings: React.FC<DatesSettingsProps> = ({ onClose }) => {
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
      bodyChildren={(
        <p className="mb-0">
          {intl.formatMessage(messages.description)}
        </p>
      )}
    />
  );
};

export default DatesSettings;
