import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { uniqBy } from 'lodash';
import { getConfig } from '@edx/frontend-platform';
import { useDispatch, useSelector } from 'react-redux';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import { ErrorAlert } from '@edx/frontend-lib-content-components';
import {
  Campaign as CampaignIcon,
  InfoOutline as InfoOutlineIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
} from '@openedx/paragon/icons';
import {
  Alert, Button, Hyperlink, Truncate,
} from '@openedx/paragon';
import { Link } from 'react-router-dom';

import { RequestStatus } from '../../data/constants';
import AlertMessage from '../../generic/alert-message';
import AlertProctoringError from '../../generic/AlertProctoringError';
import messages from './messages';
import advancedSettingsMessages from '../../advanced-settings/messages';
import { getPasteFileNotices } from '../data/selectors';
import { dismissError, removePasteFileNotices } from '../data/slice';
import { API_ERROR_TYPES } from '../constants';

const PageAlerts = ({
  courseId,
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
  errors,
}) => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const studioBaseUrl = getConfig().STUDIO_BASE_URL;
  const [showConfigAlert, setShowConfigAlert] = useState(true);
  const [showDiscussionAlert, setShowDiscussionAlert] = useState(true);
  const { newFiles, conflictingFiles, errorFiles } = useSelector(getPasteFileNotices);

  const getAssetsUrl = () => {
    if (getConfig().ENABLE_ASSETS_PAGE === 'true') {
      return `/course/${courseId}/assets/`;
    }
    return `${getConfig().STUDIO_BASE_URL}/assets/${courseId}`;
  };

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

  const newFilesPasteAlert = () => {
    const onDismiss = () => {
      dispatch(removePasteFileNotices(['newFiles']));
    };

    if (newFiles?.length) {
      return (
        <AlertMessage
          title={intl.formatMessage(messages.newFileAlertTitle, { newFilesLen: newFiles.length })}
          description={intl.formatMessage(
            messages.newFileAlertDesc,
            { newFilesLen: newFiles.length, newFilesStr: newFiles.join(', ') },
          )}
          dismissible
          show
          icon={CampaignIcon}
          variant="info"
          onClose={onDismiss}
          actions={[
            <Button
              as={Link}
              to={getAssetsUrl()}
            >
              {intl.formatMessage(messages.newFileAlertAction)}
            </Button>,
          ]}
        />
      );
    }
    return null;
  };

  const errorFilesPasteAlert = () => {
    const onDismiss = () => {
      dispatch(removePasteFileNotices(['errorFiles']));
    };

    if (errorFiles?.length) {
      return (
        <AlertMessage
          title={intl.formatMessage(messages.errorFileAlertTitle)}
          description={intl.formatMessage(
            messages.errorFileAlertDesc,
            { errorFilesLen: errorFiles.length, errorFilesStr: errorFiles.join(', ') },
          )}
          dismissible
          show
          icon={WarningIcon}
          variant="danger"
          onClose={onDismiss}
        />
      );
    }
    return null;
  };

  const conflictingFilesPasteAlert = () => {
    const onDismiss = () => {
      dispatch(removePasteFileNotices(['conflictingFiles']));
    };

    if (conflictingFiles?.length) {
      return (
        <AlertMessage
          title={intl.formatMessage(
            messages.conflictingFileAlertTitle,
            { conflictingFilesLen: conflictingFiles.length },
          )}
          description={intl.formatMessage(
            messages.conflictingFileAlertDesc,
            { conflictingFilesLen: conflictingFiles.length, conflictingFilesStr: conflictingFiles.join(', ') },
          )}
          dismissible
          show
          icon={WarningIcon}
          variant="warning"
          onClose={onDismiss}
          actions={[
            <Button
              as={Link}
              to={getAssetsUrl()}
            >
              {intl.formatMessage(messages.newFileAlertAction)}
            </Button>,
          ]}
        />
      );
    }
    return null;
  };

  const renderApiErrors = () => {
    let errorList = Object.entries(errors).filter(obj => obj[1] !== null).map(([k, v]) => {
      switch (v.type) {
        case API_ERROR_TYPES.serverError:
          return {
            key: k,
            desc: v.data || intl.formatMessage(messages.serverErrorAlertBody),
            title: intl.formatMessage(messages.serverErrorAlert),
            dismissible: v.dismissible,
          };
        case API_ERROR_TYPES.networkError:
          return {
            key: k,
            title: intl.formatMessage(messages.networkErrorAlert),
            dismissible: v.dismissible,
          };
        default:
          return {
            key: k,
            title: v.data,
            dismissible: v.dismissible,
          };
      }
    });
    errorList = uniqBy(errorList, 'title');
    if (!errorList?.length) {
      return null;
    }
    return (
      errorList.map((msgObj) => (
        msgObj.dismissible ? (
          <ErrorAlert
            isError
            hideHeading
            key={msgObj.key}
            dismissError={() => dispatch(dismissError(msgObj.key))}
          >
            <Alert.Heading>{msgObj.title}</Alert.Heading>
            {msgObj.desc && <Truncate lines={2}>{msgObj.desc}</Truncate>}
          </ErrorAlert>
        ) : (
          <Alert
            variant="danger"
            icon={ErrorIcon}
            key={msgObj.key}
          >
            <Alert.Heading>{msgObj.title}</Alert.Heading>
            {msgObj.desc && <Truncate lines={2}>{msgObj.desc}</Truncate>}
          </Alert>
        )
      ))
    );
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
      {renderApiErrors()}
      {errorFilesPasteAlert()}
      {conflictingFilesPasteAlert()}
      {newFilesPasteAlert()}
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
  errors: {},
};

PageAlerts.propTypes = {
  courseId: PropTypes.string.isRequired,
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
  errors: PropTypes.shape({
    outlineIndexApi: PropTypes.shape({
      data: PropTypes.string,
      type: PropTypes.string.isRequired,
    }),
    reindexApi: PropTypes.shape({
      data: PropTypes.string,
      type: PropTypes.string.isRequired,
    }),
    sectionLoadingApi: PropTypes.shape({
      data: PropTypes.string,
      type: PropTypes.string.isRequired,
    }),
    courseLaunchApi: PropTypes.shape({
      data: PropTypes.string,
      type: PropTypes.string.isRequired,
    }),
  }),
};

export default PageAlerts;
