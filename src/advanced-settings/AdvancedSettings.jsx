import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Button, Layout } from '@edx/paragon';
import { CheckCircle, Info, Warning } from '@edx/paragon/icons';
import { FormattedMessage, injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import AlertProctoringError from '../generic/AlertProctoringError';
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

const AdvancedSettings = ({ intl, courseId }) => {
  const advancedSettingsData = useSelector(getCourseAppSettings);
  const savingStatus = useSelector(getSavingStatus);
  const proctoringExamErrors = useSelector(getProctoringExamErrors);
  const settingsWithSendErrors = useSelector(getSendRequestErrors) || {};
  const dispatch = useDispatch();
  const [saveSettingsPrompt, showSaveSettingsPrompt] = useState(false);
  const [showDeprecated, setShowDeprecated] = useState(false);
  const [errorModal, showErrorModal] = useState(false);
  const [editedSettings, setEditedSettings] = useState({});
  const [errorFields, setErrorFields] = useState([]);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const loadingSettingsStatus = useSelector(getLoadingStatus);
  const [isQueryPending, setIsQueryPending] = useState(false);
  const [showOverrideInternetConnectionAlert, setOverrideInternetConnectionAlert] = useState(false);
  const isLoading = loadingSettingsStatus === RequestStatus.IN_PROGRESS;

  useEffect(() => {
    dispatch(fetchCourseAppSettings(courseId));
    dispatch(fetchProctoringExamErrors(courseId));
  }, [courseId]);

  useEffect(() => {
    if (savingStatus === RequestStatus.SUCCESSFUL) {
      setShowSuccessAlert(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (savingStatus === RequestStatus.FAILED) {
      setErrorFields(settingsWithSendErrors);
      showErrorModal(true);
    }
  }, [savingStatus]);

  if (isLoading) {
    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <></>;
  }

  const handleSettingChange = (e, settingName) => {
    const { value } = e.target;
    if (!saveSettingsPrompt) {
      showSaveSettingsPrompt(true);
    }
    setOverrideInternetConnectionAlert(false);
    setShowSuccessAlert(false);
    setEditedSettings((prevEditedSettings) => ({
      ...prevEditedSettings,
      [settingName]: value,
    }));
  };

  const handleResetSettingsValues = () => {
    showErrorModal(false);
    setEditedSettings({});
    showSaveSettingsPrompt(false);
    setOverrideInternetConnectionAlert(false);
  };

  const handleSettingBlur = () => {
    validateAdvancedSettingsData(editedSettings, setErrorFields, setEditedSettings);
  };

  const handleUpdateAdvancedSettingsData = () => {
    const isValid = validateAdvancedSettingsData(editedSettings, setErrorFields, setEditedSettings);
    if (isValid) {
      setIsQueryPending(true);
      setOverrideInternetConnectionAlert(true);
      showSaveSettingsPrompt(!saveSettingsPrompt);
    } else {
      setIsQueryPending(false);
      showSaveSettingsPrompt(false);
      showErrorModal(!errorModal);
    }
  };

  const handleInternetConnectionFailed = () => {
    showSaveSettingsPrompt(false);
    setShowSuccessAlert(false);
    setIsQueryPending(false);
    setOverrideInternetConnectionAlert(true);
  };

  const handleDispatchMethodCall = () => {
    setIsQueryPending(false);
    showSaveSettingsPrompt(false);
    setOverrideInternetConnectionAlert(false);
  };

  return (
    <>
      <Container size="xl" className="m-4">
        <div className="setting-header mt-5">
          {(proctoringExamErrors?.length > 0) && (
            <AlertProctoringError
              icon={Info}
              proctoringErrorsData={proctoringExamErrors}
              aria-hidden="true"
              aria-labelledby={intl.formatMessage(messages.alertProctoringAriaLabelledby)}
              aria-describedby={intl.formatMessage(messages.alertProctoringDescribedby)}
            />
          )}
          <AlertMessage
            show={showSuccessAlert}
            variant="success"
            icon={CheckCircle}
            title={intl.formatMessage(messages.alertSuccess)}
            description={intl.formatMessage(messages.alertSuccessDescriptions)}
            aria-hidden="true"
            aria-labelledby={intl.formatMessage(messages.alertSuccessAriaLabelledby)}
            aria-describedby={intl.formatMessage(messages.alertSuccessAriaDescribedby)}
          />
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
              <article>
                <div>
                  <section className="setting-items-policies">
                    <SubHeader
                      subtitle={intl.formatMessage(messages.headingSubtitle)}
                      title={intl.formatMessage(messages.headingTitle)}
                      contentTitle={intl.formatMessage(messages.policy)}
                      instruction={(
                        <FormattedMessage
                          id="course-authoring.advanced-settings.policies.description"
                          defaultMessage="{notice} Do not modify these policies unless you are familiar with their purpose."
                          values={{ notice: <strong>Warning: </strong> }}
                        />
                      )}
                    />
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
                      {Object.keys(advancedSettingsData).sort().map((settingName) => {
                        const settingData = advancedSettingsData[settingName];
                        const editedValue = editedSettings[settingName] !== undefined
                          ? editedSettings[settingName] : JSON.stringify(settingData.value, null, 4);

                        return (
                          <SettingCard
                            key={settingName}
                            settingData={settingData}
                            onChange={(e) => handleSettingChange(e, settingName)}
                            showDeprecated={showDeprecated}
                            name={settingName}
                            value={editedValue}
                            handleBlur={handleSettingBlur}
                          />
                        );
                      })}
                    </ul>
                  </section>
                </div>
              </article>
            </Layout.Element>
            <Layout.Element>
              <SettingsSidebar courseId={courseId} />
            </Layout.Element>
          </Layout>
        </section>
      </Container>
      <div className="alert-toast">
        {showOverrideInternetConnectionAlert && (
          <InternetConnectionAlert
            isQueryPending={isQueryPending}
            dispatchMethod={updateCourseAppSetting(courseId, parseArrayOrObjectValues(editedSettings))}
            onInternetConnectionFailed={handleInternetConnectionFailed}
            onDispatchMethodCall={handleDispatchMethodCall}
          />
        )}
        <AlertMessage
          show={saveSettingsPrompt}
          aria-hidden={saveSettingsPrompt}
          aria-labelledby={intl.formatMessage(messages.alertWarningAriaLabelledby)}
          aria-describedby={intl.formatMessage(messages.alertWarningAriaDescribedby)}
          role="dialog"
          actions={[
            <Button variant="tertiary" onClick={handleResetSettingsValues}>
              {intl.formatMessage(messages.buttonCancelText)}
            </Button>,
            <Button onClick={handleUpdateAdvancedSettingsData}>
              {intl.formatMessage(messages.buttonSaveText)}
            </Button>,
          ]}
          variant="warning"
          icon={Warning}
          title={intl.formatMessage(messages.alertWarning)}
          description={intl.formatMessage(messages.alertWarningDescriptions)}
        />
      </div>
      <ModalError
        isError={errorModal}
        showErrorModal={showErrorModal}
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
