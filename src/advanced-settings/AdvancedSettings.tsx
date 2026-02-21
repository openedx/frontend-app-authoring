import { useEffect, useState } from 'react';
import {
  Container, Button, Layout, StatefulButton, TransitionReplace,
} from '@openedx/paragon';
import { CheckCircle, Info, Warning } from '@openedx/paragon/icons';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import { useCourseAuthoringContext } from '@src/CourseAuthoringContext';
import { useWaffleFlags } from '@src/data/apiHooks';
import { useUserPermissions } from '@src/authz/data/apiHooks';
import { COURSE_PERMISSIONS } from '@src/authz/constants';
import PermissionDeniedAlert from 'CourseAuthoring/generic/PermissionDeniedAlert';
import AlertProctoringError from '@src/generic/AlertProctoringError';
import { LoadingSpinner } from '@src/generic/Loading';
import InternetConnectionAlert from '@src/generic/internet-connection-alert';
import { parseArrayOrObjectValues } from '@src/utils';
import { RequestStatus } from '@src/data/constants';
import SubHeader from '@src/generic/sub-header/SubHeader';
import AlertMessage from '@src/generic/alert-message';
import getPageHeadTitle from '@src/generic/utils';
import Placeholder from '@src/editors/Placeholder';

import SettingCard from './setting-card/SettingCard';
import SettingsSidebar from './settings-sidebar/SettingsSidebar';
import validateAdvancedSettingsData from './utils';
import messages from './messages';
import ModalError from './modal-error/ModalError';
import { useCourseAdvancedSettings, useProctoringExamErrors, useUpdateCourseAdvancedSettings } from './data/apiHooks';

const AdvancedSettings = () => {
  const intl = useIntl();
  const [saveSettingsPrompt, showSaveSettingsPrompt] = useState(false);
  const [showDeprecated, setShowDeprecated] = useState(false);
  const [errorModal, showErrorModal] = useState(false);
  const [editedSettings, setEditedSettings] = useState({});
  const [errorFields, setErrorFields] = useState([]);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [isEditableState, setIsEditableState] = useState(false);
  const [hasInternetConnectionError, setInternetConnectionError] = useState(false);

  const { courseId, courseDetails } = useCourseAuthoringContext();
  document.title = getPageHeadTitle(courseDetails?.name ?? '', intl.formatMessage(messages.headingTitle));

  const waffleFlags = useWaffleFlags(courseId);
  const isAuthzEnabled = waffleFlags.enableAuthzCourseAuthoring;
  const { isLoading: isLoadingUserPermissions, data: userPermissions } = useUserPermissions({
    canManageAdvancedSettings: {
      action: COURSE_PERMISSIONS.MANAGE_ADVANCED_SETTINGS,
      scope: courseId,
    },
  }, isAuthzEnabled);

  const {
    data: advancedSettingsData = {},
    isPending: isPendingSettingsStatus,
    failureReason: settingsStatusError,
  } = useCourseAdvancedSettings(courseId);

  const {
    data: proctoringExamErrors = {},
  } = useProctoringExamErrors(courseId);

  const updateMutation = useUpdateCourseAdvancedSettings(courseId);

  const {
    isPending: isQueryPending,
    isSuccess: isQuerySuccess,
    error: queryError,
  } = updateMutation;

  const isLoading = isPendingSettingsStatus || (isAuthzEnabled && isLoadingUserPermissions);
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
    if (isQuerySuccess) {
      setShowSuccessAlert(true);
      setIsEditableState(false);
      setTimeout(() => setShowSuccessAlert(false), 15000);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      showSaveSettingsPrompt(false);
    } else if (queryError && !hasInternetConnectionError) {
      // @ts-ignore
      setErrorFields(queryError?.response?.data);
      showErrorModal(true);
    }
  }, [isQuerySuccess]);

  if (isLoading) {
    return (
      <div className="row justify-content-center m-6">
        <LoadingSpinner />
      </div>
    );
  }
  if (settingsStatusError?.response?.status === 403) {
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
      setShowSuccessAlert(false);
      updateMutation.mutate(parseArrayOrObjectValues(editedSettings));
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

  const handleManuallyChangeClick = (setToState) => {
    showErrorModal(setToState);
    showSaveSettingsPrompt(true);
  };

  // Show permission denied alert when authz is enabled and user doesn't have permission
  const authzIsEnabledAndNoPermission = isAuthzEnabled
    && !isLoadingUserPermissions
    && !userPermissions?.canManageAdvancedSettings;

  if (authzIsEnabledAndNoPermission) {
    return <PermissionDeniedAlert />;
  }

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
            >
              {/* Empty children to satisfy the type checker */}
              {/* eslint-disable-next-line react/jsx-no-useless-fragment */}
              <></>
            </AlertProctoringError>
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
            isFailed={Boolean(queryError)}
            isQueryPending={isQueryPending}
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
            !isQueryPending ? (
              <Button variant="tertiary" onClick={handleResetSettingsValues}>
                {intl.formatMessage(messages.buttonCancelText)}
              </Button>
            ) : null,
            <StatefulButton
              key="statefulBtn"
              onClick={handleUpdateAdvancedSettingsData}
              state={isQueryPending ? RequestStatus.PENDING : 'default'}
              {...updateSettingsButtonState}
            />,
          ].filter((action): action is JSX.Element => action !== null)}
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

export default AdvancedSettings;
