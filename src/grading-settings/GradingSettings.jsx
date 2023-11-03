import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import {
  Container, Layout, Button, StatefulButton,
} from '@edx/paragon';
import { CheckCircle, Warning, Add as IconAdd } from '@edx/paragon/icons';

import { useModel } from '../generic/model-store';
import AlertMessage from '../generic/alert-message';
import { RequestStatus } from '../data/constants';
import InternetConnectionAlert from '../generic/internet-connection-alert';
import SubHeader from '../generic/sub-header/SubHeader';
import SectionSubHeader from '../generic/section-sub-header';
import { STATEFUL_BUTTON_STATES } from '../constants';
import {
  getGradingSettings,
  getCourseAssignmentLists,
  getSavingStatus,
  getLoadingStatus,
  getCourseSettings,
} from './data/selectors';
import { fetchGradingSettings, sendGradingSetting, fetchCourseSettingsQuery } from './data/thunks';
import GradingScale from './grading-scale/GradingScale';
import GradingSidebar from './grading-sidebar';
import messages from './messages';
import AssignmentSection from './assignment-section';
import CreditSection from './credit-section';
import DeadlineSection from './deadline-section';
import { useConvertGradeCutoffs, useUpdateGradingData } from './hooks';
import getPageHeadTitle from '../generic/utils';

const GradingSettings = ({ intl, courseId }) => {
  const gradingSettingsData = useSelector(getGradingSettings);
  const courseSettingsData = useSelector(getCourseSettings);
  const courseAssignmentLists = useSelector(getCourseAssignmentLists);
  const savingStatus = useSelector(getSavingStatus);
  const loadingStatus = useSelector(getLoadingStatus);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const dispatch = useDispatch();
  const isLoading = loadingStatus === RequestStatus.IN_PROGRESS;
  const [isQueryPending, setIsQueryPending] = useState(false);
  const [showOverrideInternetConnectionAlert, setOverrideInternetConnectionAlert] = useState(false);
  const [eligibleGrade, setEligibleGrade] = useState(null);

  const courseDetails = useModel('courseDetails', courseId);
  document.title = getPageHeadTitle(courseDetails?.name, intl.formatMessage(messages.headingTitle));

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
  } = useUpdateGradingData(gradingSettingsData, setOverrideInternetConnectionAlert, setShowSuccessAlert);

  const {
    gradeLetters,
    gradeValues,
    sortedGrades,
  } = useConvertGradeCutoffs(gradeCutoffs);

  useEffect(() => {
    if (savingStatus === RequestStatus.SUCCESSFUL) {
      setShowSuccessAlert(!showSuccessAlert);
      setShowSavePrompt(!showSavePrompt);
      setTimeout(() => setShowSuccessAlert(false), 15000);
      setIsQueryPending(!isQueryPending);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [savingStatus]);

  useEffect(() => {
    dispatch(fetchGradingSettings(courseId));
    dispatch(fetchCourseSettingsQuery(courseId));
  }, [courseId]);

  if (isLoading) {
    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <></>;
  }

  const handleQueryProcessing = () => {
    setShowSuccessAlert(false);
    dispatch(sendGradingSetting(courseId, gradingData));
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
    disabledStates: [RequestStatus.PENDING],
  };

  return (
    <>
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
                    />
                    <Button
                      variant="primary"
                      iconBefore={IconAdd}
                      onClick={handleAddAssignment}
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
            isFailed={savingStatus === RequestStatus.FAILED}
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
              <Button variant="tertiary" onClick={handleResetPageData}>
                {intl.formatMessage(messages.buttonCancelText)}
              </Button>
            ),
            <StatefulButton
              key="statefulBtn"
              onClick={handleSendGradingSettingsData}
              state={isQueryPending ? STATEFUL_BUTTON_STATES.pending : STATEFUL_BUTTON_STATES.default}
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

GradingSettings.propTypes = {
  intl: intlShape.isRequired,
  courseId: PropTypes.string.isRequired,
};

export default injectIntl(GradingSettings);
