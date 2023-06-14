import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Button, Layout } from '@edx/paragon';
import { CheckCircle, Info, WarningFilled } from '@edx/paragon/icons';
import { FormattedMessage, injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import AlertProctoringError from '../generic/AlertProctoringError';
import { parseArrayOrObjectValues } from '../utils';
import { RequestStatus } from '../data/constants';
import { fetchCourseAppSettings, updateCourseAppSetting, fetchProctoringExamErrors } from './data/thunks';
import {
  getCourseAppSettings, getSavingStatus, getProctoringExamErrors, getSendRequestErrors,
} from './data/selectors';
import SettingCard from './setting-card/SettingCard';
import AlertMessage from '../generic/alert-message';
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

  useEffect(() => {
    dispatch(fetchCourseAppSettings(courseId));
    dispatch(fetchProctoringExamErrors(courseId));
  }, [courseId]);

  useEffect(() => {
    if (savingStatus === RequestStatus.SUCCESSFUL) {
      setShowSuccessAlert(true);
    } else if (savingStatus === RequestStatus.FAILED) {
      setErrorFields(settingsWithSendErrors);
      showErrorModal(true);
    }
  }, [savingStatus]);

  const handleSettingChange = (e, settingName) => {
    const { value } = e.target;
    const emptyValue = '\u0000';
    if (!saveSettingsPrompt) {
      showSaveSettingsPrompt(true);
    }
    setEditedSettings((prevEditedSettings) => ({
      ...prevEditedSettings,
      // An empty value is needed to prevent the display of the default value,
      // after manually deleting the textarea value.
      [settingName]: value || emptyValue,
    }));
  };

  const handleResetSettingsValues = () => {
    showErrorModal(false);
    setEditedSettings({});
    showSaveSettingsPrompt(false);
  };

  const handleUpdateAdvancedSettingsData = () => {
    const isValid = validateAdvancedSettingsData(editedSettings, setErrorFields);
    if (isValid) {
      dispatch(updateCourseAppSetting(courseId, parseArrayOrObjectValues(editedSettings)));
      window.scrollTo({ top: 0, behavior: 'smooth' });
      showSaveSettingsPrompt(!saveSettingsPrompt);
    } else {
      showSaveSettingsPrompt(false);
      showErrorModal(!errorModal);
    }
  };

  return (
    <>
      <Container size="xl">
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
          <header className="setting-header-inner">
            <h1 className="setting-header-title">
              <small className="setting-header-title-subtitle">{intl.formatMessage(messages.headingSubtitle)}</small>
              {intl.formatMessage(messages.headingTitle)}
            </h1>
          </header>
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
                    <header>
                      <h2 className="setting-items-policies-title">{intl.formatMessage(messages.policy)}</h2>
                    </header>
                    <p className="setting-items-policies-instructions mb-4">
                      <FormattedMessage
                        id="course-authoring.advanced-settings.policies.description"
                        defaultMessage="{notice} Do not modify these policies unless you are familiar with their purpose."
                        values={{ notice: <strong>Warning: </strong> }}
                      />
                    </p>
                    <div className="setting-items-deprecated-setting">
                      <Button
                        variant={showDeprecated ? 'outline-brand' : 'tertiary'}
                        onClick={() => setShowDeprecated(!showDeprecated)}
                      >
                        <FormattedMessage
                          id="course-authoring.advanced-settings.deprecated.button.text"
                          defaultMessage="{visibility} Deprecated Settings"
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
                        return (
                          <SettingCard
                            key={settingName}
                            settingData={settingData}
                            onChange={(e) => handleSettingChange(e, settingName)}
                            showDeprecated={showDeprecated}
                            name={settingName}
                            value={editedSettings[settingName] || settingData.value}
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
        <AlertMessage
          show={saveSettingsPrompt}
          aria-hidden={saveSettingsPrompt}
          aria-labelledby={intl.formatMessage(messages.alertWarningAriaLabelledby)}
          aria-describedby={intl.formatMessage(messages.alertWarningAriaDescribedby)}
          role="dialog"
          actions={[
            <Button onClick={handleUpdateAdvancedSettingsData}>
              {intl.formatMessage(messages.buttonSaveText)}
            </Button>,
            <Button variant="tertiary" onClick={handleResetSettingsValues}>
              {intl.formatMessage(messages.buttonCancelText)}
            </Button>,
          ]}
          variant="warning"
          icon={WarningFilled}
          title={intl.formatMessage(messages.alertWarning)}
          description={intl.formatMessage(messages.alertWarningDescriptions)}
        />
      </div>
      <ModalError
        isError={errorModal}
        showErrorModal={showErrorModal}
        handleUndoChanges={handleResetSettingsValues}
        settingsData={advancedSettingsData}
        errorList={errorFields}
      />
    </>
  );
};

AdvancedSettings.propTypes = {
  intl: intlShape.isRequired,
  courseId: PropTypes.string.isRequired,
};

export default injectIntl(AdvancedSettings);
