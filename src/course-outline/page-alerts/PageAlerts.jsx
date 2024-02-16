import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { getConfig } from '@edx/frontend-platform';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import { ErrorAlert } from '@edx/frontend-lib-content-components';
import {
  Campaign as CampaignIcon,
  InfoOutline as InfoOutlineIcon,
  Warning as WarningIcon,
} from '@openedx/paragon/icons';
import { Alert, Button, Hyperlink } from '@openedx/paragon';

import { RequestStatus } from '../../data/constants';
import AlertMessage from '../../generic/alert-message';
import AlertProctoringError from '../../generic/AlertProctoringError';
import messages from './messages';
import advancedSettingsMessages from '../../advanced-settings/messages';

const PageAlerts = ({
  notificationDismissUrl,
  handleDismissNotification,
  discussionsSettings,
  discussionsIncontextFeedbackUrl,
  discussionsIncontextLearnmoreUrl,
  deprecatedBlocksInfo,
  proctoringErrors,
  mfeProctoredExamSettingsUrl,
  advanceSettingsUrl,
  savingStatus,
}) => {
  const intl = useIntl();
  const studioBaseUrl = getConfig().STUDIO_BASE_URL;
  const [showConfigAlert, setShowConfigAlert] = useState(true);
  const [showDiscussionAlert, setShowDiscussionAlert] = useState(true);

  const configurationErrors = () => {
    if (!notificationDismissUrl) {
      return null;
    }

    const onDismiss = () => {
      setShowConfigAlert(false);
      handleDismissNotification();
    };

    return (
      <AlertMessage
        title={intl.formatMessage(messages.configurationErrorTitle)}
        description={intl.formatMessage(messages.configurationErrorText)}
        dismissible
        show={showConfigAlert}
        icon={CampaignIcon}
        variant="info"
        onClose={onDismiss}
      />
    );
  };

  const discussionNotification = () => {
    const { providerType } = discussionsSettings || {};
    if (providerType !== 'openedx') {
      return null;
    }

    const onDismiss = () => {
      setShowDiscussionAlert(false);
    };

    return (
      <Alert
        dismissible
        show={showDiscussionAlert}
        icon={InfoOutlineIcon}
        variant="info"
        onClose={onDismiss}
        actions={[
          <Button
            href={discussionsIncontextLearnmoreUrl}
            target="_blank"
          >
            {intl.formatMessage(messages.discussionNotificationLearnMore)}
          </Button>,
        ]}
      >
        <div className="font-weight-normal text-gray mw-md">
          {intl.formatMessage(messages.discussionNotificationText, {
            platformName: process.env.SITE_NAME,
          })}
        </div>
        <Hyperlink
          showLaunchIcon={false}
          destination={discussionsIncontextFeedbackUrl}
          target="_blank"
        >
          {intl.formatMessage(messages.discussionNotificationFeedback)}
        </Hyperlink>
      </Alert>
    );
  };

  const deprecationWarning = () => {
    const {
      blocks,
      deprecatedEnabledBlockTypes,
    } = deprecatedBlocksInfo || {};

    if (blocks?.length > 0 || deprecatedEnabledBlockTypes?.length > 0) {
      return (
        <Alert
          icon={WarningIcon}
          variant="warning"
        >
          <Alert.Heading>
            {intl.formatMessage(messages.deprecationWarningTitle)}
          </Alert.Heading>
          {blocks?.length > 0 && (
            <>
              <div>
                {intl.formatMessage(messages.deprecationWarningBlocksText)}
              </div>
              <ul>
                {blocks.map(([parentUrl, name]) => (
                  <li key={parentUrl}>
                    <Hyperlink
                      destination={parentUrl}
                    >
                      {name || intl.formatMessage(messages.deprecatedComponentName)}
                    </Hyperlink>
                  </li>
                ))}
              </ul>
            </>
          )}
          {deprecatedEnabledBlockTypes?.length > 0 && (
            <>
              <div>
                <FormattedMessage
                  {...messages.deprecationWarningDeprecatedBlockText}
                  values={{
                    platformName: process.env.SITE_NAME,
                    hyperlink: (
                      <Hyperlink
                        destination={`${studioBaseUrl}${deprecatedBlocksInfo.advanceSettingsUrl}`}
                        target="_blank"
                        showLaunchIcon={false}
                      >
                        <FormattedMessage
                          {...messages.advancedSettingLinkText}
                        />
                      </Hyperlink>
                    ),
                  }}
                />
              </div>
              <ul>
                {deprecatedEnabledBlockTypes.map((name) => (
                  <li key={name}>
                    {name}
                  </li>
                ))}
              </ul>
            </>
          )}
        </Alert>
      );
    }

    return null;
  };

  const proctoringAlerts = () => {
    if (proctoringErrors?.length > 0) {
      return (
        <AlertProctoringError
          icon={InfoOutlineIcon}
          proctoringErrorsData={proctoringErrors}
          aria-hidden="true"
          aria-labelledby={intl.formatMessage(advancedSettingsMessages.alertProctoringAriaLabelledby)}
          aria-describedby={intl.formatMessage(advancedSettingsMessages.alertProctoringDescribedby)}
        >
          <Alert.Heading>
            {intl.formatMessage(messages.proctoringErrorTitle)}
          </Alert.Heading>
          <div className="mb-2">
            {mfeProctoredExamSettingsUrl
              ? (
                <FormattedMessage
                  {...messages.proctoringErrorText}
                  values={{
                    hyperlink: (
                      <Hyperlink
                        destination={mfeProctoredExamSettingsUrl}
                        target="_blank"
                        showLaunchIcon={false}
                      >
                        <FormattedMessage
                          {...messages.proctoredSettingsLinkText}
                        />
                      </Hyperlink>
                    ),
                  }}
                />
              ) : (
                <FormattedMessage
                  {...messages.proctoringErrorText}
                  values={{
                    hyperlink: (
                      <Hyperlink
                        destination={`${studioBaseUrl}${advanceSettingsUrl}`}
                        target="_blank"
                        showLaunchIcon={false}
                      >
                        <FormattedMessage
                          {...messages.advancedSettingLinkText}
                        />
                      </Hyperlink>
                    ),
                  }}
                />
              )}
          </div>
        </AlertProctoringError>
      );
    }
    return null;
  };

  return (
    <>
      {configurationErrors()}
      {discussionNotification()}
      {deprecationWarning()}
      {proctoringAlerts()}
      <ErrorAlert hideHeading isError={savingStatus === RequestStatus.FAILED}>
        {intl.formatMessage(messages.alertFailedGeneric, { actionName: 'save', type: 'changes' })}
      </ErrorAlert>
    </>
  );
};

PageAlerts.defaultProps = {
  notificationDismissUrl: '',
  handleDismissNotification: null,
  discussionsSettings: {},
  discussionsIncontextFeedbackUrl: '',
  discussionsIncontextLearnmoreUrl: '',
  deprecatedBlocksInfo: {},
  proctoringErrors: [],
  mfeProctoredExamSettingsUrl: '',
  advanceSettingsUrl: '',
  savingStatus: '',
};

PageAlerts.propTypes = {
  notificationDismissUrl: PropTypes.string,
  handleDismissNotification: PropTypes.func,
  discussionsSettings: PropTypes.shape({
    providerType: PropTypes.string,
  }),
  discussionsIncontextFeedbackUrl: PropTypes.string,
  discussionsIncontextLearnmoreUrl: PropTypes.string,
  deprecatedBlocksInfo: PropTypes.shape({
    blocks: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.string)),
    deprecatedEnabledBlockTypes: PropTypes.arrayOf(PropTypes.string),
    advanceSettingsUrl: PropTypes.string,
  }),
  proctoringErrors: PropTypes.arrayOf(PropTypes.shape({
    key: PropTypes.string,
    message: PropTypes.string,
    model: PropTypes.shape({
      deprecated: PropTypes.bool,
      displayName: PropTypes.string,
      help: PropTypes.string,
      hideOnEnabledPublisher: PropTypes.bool,
    }),
    value: PropTypes.string,
  })),
  mfeProctoredExamSettingsUrl: PropTypes.string,
  advanceSettingsUrl: PropTypes.string,
  savingStatus: PropTypes.string,
};

export default PageAlerts;
