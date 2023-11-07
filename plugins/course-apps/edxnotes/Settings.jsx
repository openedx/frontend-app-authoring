import React from 'react';
import PropTypes from 'prop-types';

import { useIntl } from '@edx/frontend-platform/i18n';

import AppSettingsModal from 'CourseAuthoring/pages-and-resources/app-settings-modal/AppSettingsModal';
import messages from './messages';

/**
 * Settings widget for the "edxnotes" Course App.
 * @param {{onClose: () => void}} props
 */
const NotesSettings = ({ onClose }) => {
  const intl = useIntl();
  return (
    <AppSettingsModal
      appId="edxnotes"
      title={intl.formatMessage(messages.heading)}
      enableAppHelp={intl.formatMessage(messages.enableNotesHelp)}
      enableAppLabel={intl.formatMessage(messages.enableNotesLabel)}
      learnMoreText={intl.formatMessage(messages.enableNotesLink)}
      onClose={onClose}
    />
  );
};

NotesSettings.propTypes = {
  onClose: PropTypes.func.isRequired,
};

export default NotesSettings;
