import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Button,
  Container,
  Layout,
  StatefulButton,
} from '@openedx/paragon';
import { Add as IconAdd, CheckCircle, Warning } from '@openedx/paragon/icons';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';

import { useCourseAuthoringContext } from '@src/CourseAuthoringContext';
import { STATEFUL_BUTTON_STATES } from '@src/constants';
import { useCourseSettings } from '@src/data/apiHooks';
import { useCourseUserPermissions } from '@src/authz/hooks';
import { getGradingPermissions } from '@src/authz/permissionHelpers';
import ConnectionErrorAlert from '@src/generic/ConnectionErrorAlert';
import PermissionDeniedAlert from '@src/generic/PermissionDeniedAlert';
import SectionSubHeader from '@src/generic/section-sub-header';
import SubHeader from '@src/generic/sub-header/SubHeader';
import AlertMessage from '@src/generic/alert-message';
import InternetConnectionAlert from '@src/generic/internet-connection-alert';
import getPageHeadTitle from '@src/generic/utils';

import {
  useGradingSettings,
  useGradingSettingUpdater,
} from './data/apiHooks';
import AssignmentSection from './assignment-section';
import CreditSection from './credit-section';
import DeadlineSection from './deadline-section';
import GradingScale from './grading-scale/GradingScale';
import GradingSidebar from './grading-sidebar';
import { useConvertGradeCutoffs, useUpdateGradingData } from './hooks';
import messages from './messages';

const GradingSettings = () => {
  const intl = useIntl();
  const { courseId, courseDetails } = useCourseAuthoringContext();

  const {
    isLoading: isLoadingUserPermissions,
    canViewGradingSettings,
    canEditGradingSettings,
  } = useCourseUserPermissions(courseId, getGradingPermissions(courseId));

  const {
    data: gradingSettings,
    isLoading: isGradingSettingsLoading,
    isError: isGradingSettingsError,
  } = useGradingSettings(courseId);
  const {
    data: courseSettingsData,
    isLoading: isCourseSettingsLoading,
    isError: isCourseSettingsError,
  } = useCourseSettings(courseId);
  const {
    mutate: updateGradingSettings,
    isPending: savePending,
    isSuccess: savingStatus,
    isError: savingFailed,
  } = useGradingSettingUpdater(courseId);

  const courseAssignmentLists = gradingSettings?.courseAssignmentLists;
  const courseGradingDetails = gradingSettings?.courseDetails;
  const isLoadingDenied = isGradingSettingsError || isCourseSettingsError;
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const isLoading = isCourseSettingsLoading || isGradingSettingsLoading || isLoadingUserPermissions;
  const [isQueryPending, setIsQueryPending] = useState(false);
  const [showOverrideInternetConnectionAlert, setOverrideInternetConnectionAlert] = useState(false);
  const [eligibleGrade, setEligibleGrade] = useState(null);

  const courseName = courseDetails?.name || '';

  const {
    graders,
    resetDataRef,
    setGradingData,
    gradingData,
    gradeCutoffs,
    gracePeriod,
    minimumGradeCredit,
    showSavePrompt,
    setShowSavePrompt,
    handleResetPageData,
    handleAddAssignment,
    handleRemoveAssignment,
  } = useUpdateGradingData(courseGradingDetails, setOverrideInternetConnectionAlert, setShowSuccessAlert);

  const {
    gradeLetters,
    gradeValues,
    sortedGrades,
  } = useConvertGradeCutoffs(gradeCutoffs);

  useEffect(() => {
    if (savingStatus) {
      setShowSuccessAlert(!showSuccessAlert);
      setShowSavePrompt(!showSavePrompt);
      setTimeout(() => setShowSuccessAlert(false), 15000);
      setIsQueryPending(!isQueryPending);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [savePending]);

  if (!isLoadingUserPermissions && !canViewGradingSettings) {
    return <PermissionDeniedAlert />;
  }

  if (isLoadingDenied) {
    return (
      <Container size="xl" className="course-unit px-4 mt-4">
        <ConnectionErrorAlert />
      </Container>
    );
  }

  if (isLoading) {
    return null;
  }

  const isEditable = !isLoadingUserPermissions && canEditGradingSettings;

  const handleQueryProcessing = () => {
    setShowSuccessAlert(false);
    updateGradingSettings(gradingData);
  };

  const handleSendGradingSettingsData = () => {
    setIsQueryPending(true);
    setOverrideInternetConnectionAlert(true);
  };

  const handleInternetConnectionFailed = () => {
    setShowSavePrompt(false);
    setShowSuccessAlert(false);
    setIsQueryPending(false);
    setOverrideInternetConnectionAlert(true);
  };

  const updateValuesButtonState = {
    labels: {
      default: intl.formatMessage(messages.buttonSaveText),
      pending: intl.formatMessage(messages.buttonSavingText),
    },
    disabledStates: [STATEFUL_BUTTON_STATES.pending],
  };

  return (
    <>
      <Helmet>
        <title>{getPageHeadTitle(courseName, intl.formatMessage(messages.headingTitle))}</title>
      </Helmet>
      <Container size="xl" className="grading px-4">
        <div className="mt-5">
          <AlertMessage
            show={showSuccessAlert}
            variant="success"
            icon={CheckCircle}
            title={intl.formatMessage(messages.alertSuccess)}
            aria-hidden="true"
            aria-labelledby={intl.formatMessage(messages.alertSuccessAriaLabelledby)}
            aria-describedby={intl.formatMessage(messages.alertSuccessAriaDescribedby)}
          />
        </div>
        <div>
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
                  <SubHeader
                    title={intl.formatMessage(messages.headingTitle)}
                    subtitle={intl.formatMessage(messages.headingSubtitle)}
                    contentTitle={intl.formatMessage(messages.policy)}
                    description={intl.formatMessage(messages.policiesDescription)}
                  />
                  <section>
                    <GradingScale
                      gradeCutoffs={gradeCutoffs}
                      showSavePrompt={setShowSavePrompt}
                      gradeLetters={gradeLetters}
                      gradeValues={gradeValues}
                      sortedGrades={sortedGrades}
                      setShowSuccessAlert={setShowSuccessAlert}
                      setGradingData={setGradingData}
                      resetDataRef={resetDataRef}
                      setOverrideInternetConnectionAlert={setOverrideInternetConnectionAlert}
                      setEligibleGrade={setEligibleGrade}
                      defaultGradeDesignations={gradingSettings?.defaultGradeDesignations}
                      isEditable={isEditable}
                    />
                  </section>
                  {courseSettingsData.creditEligibilityEnabled && courseSettingsData.isCreditCourse && (
                    <section>
                      <SectionSubHeader
                        title={intl.formatMessage(messages.creditEligibilitySectionTitle)}
                        description={intl.formatMessage(messages.creditEligibilitySectionDescription)}
                      />
                      <CreditSection
                        eligibleGrade={eligibleGrade}
                        setShowSavePrompt={setShowSavePrompt}
                        minimumGradeCredit={minimumGradeCredit}
                        setGradingData={setGradingData}
                        setShowSuccessAlert={setShowSuccessAlert}
                        isEditable={isEditable}
                      />
                    </section>
                  )}
                  <section>
                    <SectionSubHeader
                      title={intl.formatMessage(messages.gradingRulesPoliciesSectionTitle)}
                      description={intl.formatMessage(messages.gradingRulesPoliciesSectionDescription)}
                    />
                    <DeadlineSection
                      setShowSavePrompt={setShowSavePrompt}
                      gracePeriod={gracePeriod}
                      setGradingData={setGradingData}
                      setShowSuccessAlert={setShowSuccessAlert}
                      isEditable={isEditable}
                    />
                  </section>
                  <section>
                    <header className="row justify-content-between align-items-center mt-4 mx-0 mb-2">
                      <h2 className="lead">
                        {intl.formatMessage(messages.assignmentTypeSectionTitle)}
                      </h2>
                      <span className="small text-gray-700">
                        {intl.formatMessage(messages.assignmentTypeSectionDescription)}
                      </span>
                    </header>
                    <AssignmentSection
                      handleRemoveAssignment={handleRemoveAssignment}
                      setShowSavePrompt={setShowSavePrompt}
                      graders={graders}
                      setGradingData={setGradingData}
                      courseAssignmentLists={courseAssignmentLists}
                      setShowSuccessAlert={setShowSuccessAlert}
                      isEditable={isEditable}
                    />
                    <Button
                      variant="primary"
                      iconBefore={IconAdd}
                      onClick={handleAddAssignment}
                      disabled={!isEditable}
                    >
                      {intl.formatMessage(messages.addNewAssignmentTypeBtn)}
                    </Button>
                  </section>
                </article>
              </Layout.Element>
              <Layout.Element>
                <GradingSidebar
                  courseId={courseId}
                  intl={intl}
                  proctoredExamSettingsUrl={courseSettingsData.mfeProctoredExamSettingsUrl}
                />
              </Layout.Element>
            </Layout>
          </section>
        </div>
      </Container>
      <div className="alert-toast">
        {showOverrideInternetConnectionAlert && (
          <InternetConnectionAlert
            isFailed={savingFailed}
            isQueryPending={isQueryPending}
            onQueryProcessing={handleQueryProcessing}
            onInternetConnectionFailed={handleInternetConnectionFailed}
          />
        )}
        <AlertMessage
          show={showSavePrompt}
          aria-hidden={!showSavePrompt}
          aria-labelledby={intl.formatMessage(messages.alertWarningAriaLabelledby)}
          aria-describedby={intl.formatMessage(messages.alertWarningAriaDescribedby)}
          data-testid="grading-settings-save-alert"
          role="dialog"
          actions={[
            !isQueryPending && (
              <Button key="cancel" variant="tertiary" onClick={handleResetPageData}>
                {intl.formatMessage(messages.buttonCancelText)}
              </Button>
            ),
            <StatefulButton
              key="statefulBtn"
              onClick={handleSendGradingSettingsData}
              state={isQueryPending ? STATEFUL_BUTTON_STATES.pending : STATEFUL_BUTTON_STATES.default}
              disabled={!isEditable}
              {...updateValuesButtonState}
            />,
          ].filter(Boolean)}
          variant="warning"
          icon={Warning}
          title={intl.formatMessage(messages.alertWarning)}
          description={intl.formatMessage(messages.alertWarningDescriptions)}
        />
      </div>
    </>
  );
};

export default GradingSettings;
