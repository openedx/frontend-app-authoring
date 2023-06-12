import React from 'react';
import PropTypes from 'prop-types';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import AppSettingsModal from '../app-settings-modal/AppSettingsModal';
import messages from './messages';

const NotesSettings = ({ intl, onClose }) => (
  <AppSettingsModal
    appId="edxnotes"
    title={intl.formatMessage(messages.heading)}
    enableAppHelp={intl.formatMessage(messages.enableNotesHelp)}
    enableAppLabel={intl.formatMessage(messages.enableNotesLabel)}
    learnMoreText={intl.formatMessage(messages.enableNotesLink)}
    onClose={onClose}
  />
);

NotesSettings.propTypes = {
  intl: intlShape.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default injectIntl(NotesSettings);
