import React from 'react';
import PropTypes from 'prop-types';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Hyperlink } from '@openedx/paragon';

import AppSettingsModal from '../app-settings-modal/AppSettingsModal';
import messages from './messages';
import { useModel } from '../../generic/model-store';

const LearningAssistantSettings = ({ intl, onClose }) => {
  const appId = 'learning_assistant';
  const appInfo = useModel('courseApps', appId);

  // We need to render more than one link, so we use the bodyChildren prop.
  const bodyChildren = (
    appInfo?.documentationLinks?.learnMoreOpenaiDataPrivacy && appInfo?.documentationLinks?.learnMoreOpenai
      ? (
        <div className="d-flex flex-column">
          {appInfo.documentationLinks?.learnMoreOpenaiDataPrivacy && (
            <Hyperlink
              className="text-primary-500"
              destination={appInfo.documentationLinks.learnMoreOpenaiDataPrivacy}
              target="_blank"
              rel="noreferrer noopener"
            >
              {intl.formatMessage(messages.learningAssistantOpenAIDataPrivacyLink)}
            </Hyperlink>
          )}
          {appInfo.documentationLinks?.learnMoreOpenai && (
            <Hyperlink
              className="text-primary-500"
              destination={appInfo.documentationLinks.learnMoreOpenai}
              target="_blank"
              rel="noreferrer noopener"
            >
              {intl.formatMessage(messages.learningAssistantOpenAILink)}
            </Hyperlink>
          )}
        </div>
      )
      : null
  );

  return (
    <AppSettingsModal
      appId={appId}
      title={intl.formatMessage(messages.heading)}
      enableAppHelp={intl.formatMessage(messages.enableLearningAssistantHelp)}
      enableAppLabel={intl.formatMessage(messages.enableLearningAssistantLabel)}
      bodyChildren={bodyChildren}
      onClose={onClose}
    />
  );
};

LearningAssistantSettings.propTypes = {
  intl: intlShape.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default injectIntl(LearningAssistantSettings);
