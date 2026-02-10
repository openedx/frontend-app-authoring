import { getConfig } from '@edx/frontend-platform';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import {
  Alert, Button, Hyperlink, Truncate,
} from '@openedx/paragon';
import {
  Campaign as CampaignIcon,
  Error as ErrorIcon,
  InfoOutline as InfoOutlineIcon,
  Warning as WarningIcon,
} from '@openedx/paragon/icons';
import { uniqBy } from 'lodash';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { AlertAgreementGatedFeature } from '@src/generic/agreement-gated-feature';
import { AgreementGated } from '../../constants';
import CourseOutlinePageAlertsSlot from '../../plugin-slots/CourseOutlinePageAlertsSlot';
import advancedSettingsMessages from '../../advanced-settings/messages';
import { OutOfSyncAlert } from '../../course-libraries/OutOfSyncAlert';
import { RequestStatus } from '../../data/constants';

import ErrorAlert from '../../editors/sharedComponents/ErrorAlerts/ErrorAlert';
import AlertMessage from '../../generic/alert-message';
import AlertProctoringError from '../../generic/AlertProctoringError';
import { API_ERROR_TYPES } from '../constants';
import { getPasteFileNotices } from '../data/selectors';
import { dismissError, removePasteFileNotices } from '../data/slice';
import messages from './messages';

const PageAlerts = ({
  courseId,
  notificationDismissUrl,
  handleDismissNotification,
  discussionsSettings,
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
  const discussionAlertDismissKey = `discussionAlertDismissed-${courseId}`;
  const [showConfigAlert, setShowConfigAlert] = useState(true);
  const [showDiscussionAlert, setShowDiscussionAlert] = useState(
    localStorage.getItem(discussionAlertDismissKey) === null,
  );
  const { newFiles, conflictingFiles, errorFiles } = useSelector(getPasteFileNotices);
  const [showOutOfSyncAlert, setShowOutOfSyncAlert] = useState(false);
  const navigate = useNavigate();

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
      localStorage.setItem(discussionAlertDismissKey, 'true');
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
        case API_ERROR_TYPES.forbidden: {
          const description = intl.formatMessage(messages.forbiddenAlertBody, {
            LMS: (
              <Hyperlink
                destination={`${getConfig().LMS_BASE_URL}`}
                target="_blank"
                showLaunchIcon={false}
              >
                {intl.formatMessage(messages.forbiddenAlertLmsUrl)}
              </Hyperlink>
            ),
          });
          return {
            key: k,
            desc: description,
            title: intl.formatMessage(messages.forbiddenAlert),
            dismissible: v.dismissible,
          };
        }
        case API_ERROR_TYPES.serverError: {
          const description = (
            <Truncate.Deprecated lines={2}>
              {v.data || intl.formatMessage(messages.serverErrorAlertBody)}
            </Truncate.Deprecated>
          );
          return {
            key: k,
            desc: description,
            title: intl.formatMessage(messages.serverErrorAlert),
            dismissible: v.dismissible,
          };
        }
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
            {msgObj.desc}
          </ErrorAlert>
        ) : (
          <Alert
            variant="danger"
            icon={ErrorIcon}
            key={msgObj.key}
          >
            <Alert.Heading>{msgObj.title}</Alert.Heading>
            {msgObj.desc}
          </Alert>
        )
      ))
    );
  };

  const renderOutOfSyncAlert = () => (
    <OutOfSyncAlert
      courseId={courseId}
      onReview={() => navigate(`/course/${courseId}/libraries?tab=review`)}
      showAlert={showOutOfSyncAlert}
      setShowAlert={setShowOutOfSyncAlert}
    />
  );

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
      {renderOutOfSyncAlert()}
      <AlertAgreementGatedFeature
        gatingTypes={[AgreementGated.UPLOAD, AgreementGated.UPLOAD_VIDEOS, AgreementGated.UPLOAD_FILES]}
      />
      <CourseOutlinePageAlertsSlot />
    </>
  );
};

PageAlerts.defaultProps = {
  notificationDismissUrl: '',
  handleDismissNotification: null,
  discussionsSettings: {},
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
