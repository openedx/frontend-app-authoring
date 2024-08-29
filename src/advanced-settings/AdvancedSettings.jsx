import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container, Button, Layout, StatefulButton, TransitionReplace,
} from '@openedx/paragon';
import { CheckCircle, Info, Warning } from '@openedx/paragon/icons';
import { FormattedMessage, injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import Placeholder from '../editors/Placeholder';

import AlertProctoringError from '../generic/AlertProctoringError';
import { useModel } from '../generic/model-store';
import InternetConnectionAlert from '../generic/internet-connection-alert';
import { parseArrayOrObjectValues } from '../utils';
import { RequestStatus } from '../data/constants';
import SubHeader from '../generic/sub-header/SubHeader';
import AlertMessage from '../generic/alert-message';
import { fetchCourseAppSettings, updateCourseAppSetting, fetchProctoringExamErrors } from './data/thunks';
import {
  getCourseAppSettings, getSavingStatus, getProctoringExamErrors, getSendRequestErrors, getLoadingStatus,
} from './data/selectors';
import SettingCard from './setting-card/SettingCard';
import SettingsSidebar from './settings-sidebar/SettingsSidebar';
import validateAdvancedSettingsData from './utils';
import messages from './messages';
import ModalError from './modal-error/ModalError';
import getPageHeadTitle from '../generic/utils';

const AdvancedSettings = ({ intl, courseId }) => {
  const dispatch = useDispatch();
  const [saveSettingsPrompt, showSaveSettingsPrompt] = useState(false);
  const [showDeprecated, setShowDeprecated] = useState(false);
  const [errorModal, showErrorModal] = useState(false);
  const [editedSettings, setEditedSettings] = useState({});
  const [errorFields, setErrorFields] = useState([]);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [isQueryPending, setIsQueryPending] = useState(false);
  const [isEditableState, setIsEditableState] = useState(false);
  const [hasInternetConnectionError, setInternetConnectionError] = useState(false);

  const courseDetails = useModel('courseDetails', courseId);
  document.title = getPageHeadTitle(courseDetails?.name, intl.formatMessage(messages.headingTitle));

  useEffect(() => {
    dispatch(fetchCourseAppSettings(courseId));
    dispatch(fetchProctoringExamErrors(courseId));
  }, [courseId]);

  const advancedSettingsData = useSelector(getCourseAppSettings);
  const savingStatus = useSelector(getSavingStatus);
  const proctoringExamErrors = useSelector(getProctoringExamErrors);
  const settingsWithSendErrors = useSelector(getSendRequestErrors) || {};
  const loadingSettingsStatus = useSelector(getLoadingStatus);

  const isLoading = loadingSettingsStatus === RequestStatus.IN_PROGRESS;
  const updateSettingsButtonState = {
    labels: {
      default: intl.formatMessage(messages.buttonSaveText),
      pending: intl.formatMessage(messages.buttonSavingText),
    },
    disabledStates: ['pending'],
  };
  const {
    proctoringErrors,
    mfeProctoredExamSettingsUrl,
  } = proctoringExamErrors;

  useEffect(() => {
    if (savingStatus === RequestStatus.SUCCESSFUL) {
      setIsQueryPending(false);
      setShowSuccessAlert(true);
      setIsEditableState(false);
      setTimeout(() => setShowSuccessAlert(false), 15000);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      showSaveSettingsPrompt(false);
    } else if (savingStatus === RequestStatus.FAILED && !hasInternetConnectionError) {
      setErrorFields(settingsWithSendErrors);
      showErrorModal(true);
    }
  }, [savingStatus]);

  if (isLoading) {
    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <></>;
  }
  if (loadingSettingsStatus === RequestStatus.DENIED) {
    return (
      <div className="row justify-content-center m-6">
        <Placeholder />
      </div>
    );
  }

  const handleResetSettingsValues = () => {
    setIsEditableState(false);
    showErrorModal(false);
    setEditedSettings({});
    showSaveSettingsPrompt(false);
  };

  const handleSettingBlur = () => {
    validateAdvancedSettingsData(editedSettings, setErrorFields, setEditedSettings);
  };

  const handleUpdateAdvancedSettingsData = () => {
    const isValid = validateAdvancedSettingsData(editedSettings, setErrorFields, setEditedSettings);
    if (isValid) {
      setIsQueryPending(true);
    } else {
      showSaveSettingsPrompt(false);
      showErrorModal(!errorModal);
    }
  };

  const handleInternetConnectionFailed = () => {
    setInternetConnectionError(true);
    showSaveSettingsPrompt(false);
    setShowSuccessAlert(false);
  };

  const handleQueryProcessing = () => {
    setShowSuccessAlert(false);
    dispatch(updateCourseAppSetting(courseId, parseArrayOrObjectValues(editedSettings)));
  };

  const handleManuallyChangeClick = (setToState) => {
    showErrorModal(setToState);
    showSaveSettingsPrompt(true);
  };

  return (
    <>
      <Container size="xl" className="advanced-settings px-4">
        <div className="setting-header mt-5">
          {(proctoringErrors?.length > 0) && (
            <AlertProctoringError
              icon={Info}
              proctoringErrorsData={proctoringErrors}
              aria-hidden="true"
              aria-labelledby={intl.formatMessage(messages.alertProctoringAriaLabelledby)}
              aria-describedby={intl.formatMessage(messages.alertProctoringDescribedby)}
            />
          )}
          <TransitionReplace>
            {showSuccessAlert ? (
              <AlertMessage
                key={intl.formatMessage(messages.alertSuccessAriaLabelledby)}
                show={showSuccessAlert}
                variant="success"
                icon={CheckCircle}
                title={intl.formatMessage(messages.alertSuccess)}
                description={intl.formatMessage(messages.alertSuccessDescriptions)}
                aria-hidden="true"
                aria-labelledby={intl.formatMessage(messages.alertSuccessAriaLabelledby)}
                aria-describedby={intl.formatMessage(messages.alertSuccessAriaDescribedby)}
              />
            ) : null}
          </TransitionReplace>
        </div>
        <section className="setting-items mb-4">
          <Layout
            lg={[{ span: 9 }, { span: 3 }]}
            md={[{ span: 9 }, { span: 3 }]}
            sm={[{ span: 9 }, { span: 3 }]}
            xs={[{ span: 9 }, { span: 3 }]}
            xl={[{ span: 9 }, { span: 3 }]}
          >
            <Layout.Element>
              <SubHeader
                subtitle={intl.formatMessage(messages.headingSubtitle)}
                title={intl.formatMessage(messages.headingTitle)}
                contentTitle={intl.formatMessage(messages.policy)}
              />
              <article>
                <div>
                  <section className="setting-items-policies">
                    <div className="small">
                      <FormattedMessage
                        id="course-authoring.advanced-settings.policies.description"
                        defaultMessage="{notice} Do not modify these policies unless you are familiar with their purpose."
                        values={{ notice: <strong>Warning:  </strong> }}
                      />
                    </div>
                    <div className="setting-items-deprecated-setting">
                      <Button
                        variant={showDeprecated ? 'outline-brand' : 'tertiary'}
                        onClick={() => setShowDeprecated(!showDeprecated)}
                        size="sm"
                      >
                        <FormattedMessage
                          id="course-authoring.advanced-settings.deprecated.button.text"
                          defaultMessage="{visibility} deprecated settings"
                          values={{
                            visibility:
                                    showDeprecated ? intl.formatMessage(messages.deprecatedButtonHideText)
                                      : intl.formatMessage(messages.deprecatedButtonShowText),
                          }}
                        />
                      </Button>
                    </div>
                    <ul className="setting-items-list p-0">
                      {Object.keys(advancedSettingsData).map((settingName) => {
                        const settingData = advancedSettingsData[settingName];
                        if (settingData.deprecated && !showDeprecated) {
                          return null;
                        }
                        return (
                          <SettingCard
                            key={settingName}
                            settingData={settingData}
                            name={settingName}
                            showSaveSettingsPrompt={showSaveSettingsPrompt}
                            saveSettingsPrompt={saveSettingsPrompt}
                            setEdited={setEditedSettings}
                            handleBlur={handleSettingBlur}
                            isEditableState={isEditableState}
                            setIsEditableState={setIsEditableState}
                          />
                        );
                      })}
                    </ul>
                  </section>
                </div>
              </article>
            </Layout.Element>
            <Layout.Element>
              <SettingsSidebar
                courseId={courseId}
                proctoredExamSettingsUrl={mfeProctoredExamSettingsUrl}
              />
            </Layout.Element>
          </Layout>
        </section>
      </Container>
      <div className="alert-toast">
        {isQueryPending && (
          <InternetConnectionAlert
            isFailed={savingStatus === RequestStatus.FAILED}
            isQueryPending={isQueryPending}
            onQueryProcessing={handleQueryProcessing}
            onInternetConnectionFailed={handleInternetConnectionFailed}
          />
        )}
        <AlertMessage
          show={saveSettingsPrompt}
          aria-hidden={saveSettingsPrompt}
          aria-labelledby={intl.formatMessage(messages.alertWarningAriaLabelledby)}
          aria-describedby={intl.formatMessage(messages.alertWarningAriaDescribedby)}
          role="dialog"
          actions={[
            !isQueryPending && (
              <Button variant="tertiary" onClick={handleResetSettingsValues}>
                {intl.formatMessage(messages.buttonCancelText)}
              </Button>
            ),
            <StatefulButton
              key="statefulBtn"
              onClick={handleUpdateAdvancedSettingsData}
              state={isQueryPending ? RequestStatus.PENDING : 'default'}
              {...updateSettingsButtonState}
            />,
          ].filter(Boolean)}
          variant="warning"
          icon={Warning}
          title={intl.formatMessage(messages.alertWarning)}
          description={intl.formatMessage(messages.alertWarningDescriptions)}
        />
      </div>
      <ModalError
        isError={errorModal}
        showErrorModal={(setToState) => handleManuallyChangeClick(setToState)}
        handleUndoChanges={handleResetSettingsValues}
        settingsData={advancedSettingsData}
        errorList={errorFields.length > 0 ? errorFields : []}
      />
    </>
  );
};

AdvancedSettings.propTypes = {
  intl: intlShape.isRequired,
  courseId: PropTypes.string.isRequired,
};

export default injectIntl(AdvancedSettings);
