import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import {
  Container, Button, Layout, StatefulButton,
} from '@edx/paragon';
import {
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
} from '@edx/paragon/icons';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import Placeholder from '@edx/frontend-lib-content-components';

import { RequestStatus } from '../data/constants';
import { useModel } from '../generic/model-store';
import AlertMessage from '../generic/alert-message';
import InternetConnectionAlert from '../generic/internet-connection-alert';
import { STATEFUL_BUTTON_STATES } from '../constants';
import {
  fetchCourseSettingsQuery,
  fetchCourseDetailsQuery,
  updateCourseDetailsQuery,
} from './data/thunks';
import {
  getCourseSettings,
  getCourseDetails,
  getLoadingDetailsStatus,
  getLoadingSettingsStatus,
} from './data/selectors';
import BasicSection from './basic-section';
import CreditSection from './credit-section';
import DetailsSection from './details-section';
import IntroducingSection from './introducing-section';
import PacingSection from './pacing-section';
import ScheduleSection from './schedule-section';
import LearningOutcomesSection from './learning-outcomes-section';
import InstructorsSection from './instructors-section';
import RequirementsSection from './requirements-section';
import LicenseSection from './license-section';
import ScheduleSidebar from './schedule-sidebar';
import messages from './messages';
import { useSaveValuesPrompt } from './hooks';
import getPageHeadTitle from '../generic/utils';

const ScheduleAndDetails = ({ intl, courseId }) => {
  const courseSettings = useSelector(getCourseSettings);
  const courseDetails = useSelector(getCourseDetails);
  const loadingDetailsStatus = useSelector(getLoadingDetailsStatus);
  const loadingSettingsStatus = useSelector(getLoadingSettingsStatus);
  const isLoading = loadingDetailsStatus === RequestStatus.IN_PROGRESS
    || loadingSettingsStatus === RequestStatus.IN_PROGRESS;

  const course = useModel('courseDetails', courseId);
  document.title = getPageHeadTitle(course?.name, intl.formatMessage(messages.headingTitle));

  const {
    errorFields,
    savingStatus,
    editedValues,
    isQueryPending,
    isEditableState,
    showModifiedAlert,
    showSuccessfulAlert,
    dispatch,
    handleResetValues,
    handleValuesChange,
    handleUpdateValues,
    handleQueryProcessing,
    handleInternetConnectionFailed,
  } = useSaveValuesPrompt(courseId, updateCourseDetailsQuery, courseDetails);

  const {
    platformName,
    isCreditCourse,
    upgradeDeadline,
    languageOptions,
    marketingEnabled,
    licensingEnabled,
    aboutPageEditable,
    courseDisplayName,
    sidebarHtmlEnabled,
    lmsLinkForAboutPage,
    enrollmentEndEditable,
    isEntranceExamsEnabled,
    creditEligibilityEnabled,
    shortDescriptionEditable,
    enableExtendedCourseDetails,
    isPrerequisiteCoursesEnabled,
    mfeProctoredExamSettingsUrl,
    possiblePreRequisiteCourses,
    canShowCertificateAvailableDateField,
  } = courseSettings;

  const {
    org,
    courseId: courseNumber,
    run,
    title,
    effort,
    endDate,
    license,
    language,
    subtitle,
    overview,
    duration,
    selfPaced,
    startDate,
    introVideo,
    description,
    learningInfo,
    enrollmentEnd,
    instructorInfo,
    enrollmentStart,
    shortDescription,
    aboutSidebarHtml,
    preRequisiteCourses,
    entranceExamEnabled,
    courseImageAssetPath,
    bannerImageAssetPath,
    certificateAvailableDate,
    entranceExamMinimumScorePct,
    certificatesDisplayBehavior,
    videoThumbnailImageAssetPath,
  } = editedValues;

  useEffect(() => {
    dispatch(fetchCourseSettingsQuery(courseId));
    dispatch(fetchCourseDetailsQuery(courseId));
  }, [courseId]);

  if (isLoading) {
    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <></>;
  }

  if (loadingDetailsStatus === RequestStatus.DENIED || loadingSettingsStatus === RequestStatus.DENIED) {
    return (
      <div className="row justify-content-center m-6">
        <Placeholder />
      </div>
    );
  }

  const showCreditSection = creditEligibilityEnabled && isCreditCourse;
  const showRequirementsSection = aboutPageEditable || isPrerequisiteCoursesEnabled || isEntranceExamsEnabled;
  const hasErrors = !!Object.keys(errorFields).length;
  const updateValuesButtonState = {
    labels: {
      default: intl.formatMessage(messages.buttonSaveText),
      pending: intl.formatMessage(messages.buttonSavingText),
    },
    disabledStates: [STATEFUL_BUTTON_STATES.pending],
  };
  const alertWhileSavingTitle = hasErrors
    ? intl.formatMessage(messages.alertWarningOnSaveWithError)
    : intl.formatMessage(messages.alertWarning);

  const alertWhileSavingDescription = hasErrors
    ? intl.formatMessage(messages.alertWarningDescriptionsOnSaveWithError)
    : intl.formatMessage(messages.alertWarningDescriptions);

  return (
    <>
      <Container size="xl" className="schedule-and-details px-4">
        <div className="mt-5">
          <AlertMessage
            show={showSuccessfulAlert}
            variant="success"
            icon={CheckCircleIcon}
            title={intl.formatMessage(messages.alertSuccess)}
            aria-hidden="true"
            aria-labelledby={intl.formatMessage(
              messages.alertSuccessAriaLabelledby,
            )}
            aria-describedby={intl.formatMessage(
              messages.alertSuccessAriaDescribedby,
            )}
          />
          <header>
            <span className="small text-gray-700">
              {intl.formatMessage(messages.headingSubtitle)}
            </span>
            <h2 className="mb-4 pb-1">
              {intl.formatMessage(messages.headingTitle)}
            </h2>
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
                  <BasicSection
                    org={org}
                    courseNumber={courseNumber}
                    run={run}
                    lmsLinkForAboutPage={lmsLinkForAboutPage}
                    marketingEnabled={marketingEnabled}
                    courseDisplayName={courseDisplayName}
                    platformName={platformName}
                  />
                  {showCreditSection && (
                    <CreditSection
                      creditRequirements={courseSettings?.creditRequirements}
                    />
                  )}
                  <PacingSection
                    selfPaced={selfPaced}
                    startDate={startDate}
                    onChange={handleValuesChange}
                  />
                  <ScheduleSection
                    endDate={endDate}
                    startDate={startDate}
                    errorFields={errorFields}
                    platformName={platformName}
                    enrollmentEnd={enrollmentEnd}
                    enrollmentStart={enrollmentStart}
                    upgradeDeadline={upgradeDeadline}
                    enrollmentEndEditable={enrollmentEndEditable}
                    certificateAvailableDate={certificateAvailableDate}
                    certificatesDisplayBehavior={certificatesDisplayBehavior}
                    canShowCertificateAvailableDateField={canShowCertificateAvailableDateField}
                    onChange={handleValuesChange}
                  />
                  {aboutPageEditable && (
                    <DetailsSection
                      language={language}
                      languageOptions={languageOptions}
                      onChange={handleValuesChange}
                    />
                  )}
                  <IntroducingSection
                    title={title}
                    overview={overview}
                    duration={duration}
                    subtitle={subtitle}
                    introVideo={introVideo}
                    description={description}
                    aboutSidebarHtml={aboutSidebarHtml}
                    shortDescription={shortDescription}
                    aboutPageEditable={aboutPageEditable}
                    sidebarHtmlEnabled={sidebarHtmlEnabled}
                    lmsLinkForAboutPage={lmsLinkForAboutPage}
                    courseImageAssetPath={courseImageAssetPath}
                    bannerImageAssetPath={bannerImageAssetPath}
                    shortDescriptionEditable={shortDescriptionEditable}
                    enableExtendedCourseDetails={enableExtendedCourseDetails}
                    videoThumbnailImageAssetPath={videoThumbnailImageAssetPath}
                    onChange={handleValuesChange}
                  />
                  {enableExtendedCourseDetails && (
                    <>
                      <LearningOutcomesSection
                        learningInfo={learningInfo}
                        onChange={handleValuesChange}
                      />
                      <InstructorsSection
                        instructors={instructorInfo?.instructors}
                        onChange={handleValuesChange}
                      />
                    </>
                  )}
                  {showRequirementsSection && (
                    <RequirementsSection
                      effort={effort}
                      errorFields={errorFields}
                      aboutPageEditable={aboutPageEditable}
                      entranceExamEnabled={entranceExamEnabled}
                      preRequisiteCourses={preRequisiteCourses}
                      isEntranceExamsEnabled={isEntranceExamsEnabled}
                      possiblePreRequisiteCourses={possiblePreRequisiteCourses}
                      entranceExamMinimumScorePct={entranceExamMinimumScorePct}
                      isPrerequisiteCoursesEnabled={
                        isPrerequisiteCoursesEnabled
                      }
                      onChange={handleValuesChange}
                    />
                  )}
                  {licensingEnabled && (
                    <LicenseSection
                      license={license}
                      onChange={handleValuesChange}
                    />
                  )}
                </div>
              </article>
            </Layout.Element>
            <Layout.Element>
              <ScheduleSidebar
                courseId={courseId}
                proctoredExamSettingsUrl={mfeProctoredExamSettingsUrl}
              />
            </Layout.Element>
          </Layout>
        </section>
      </Container>
      <div className="alert-toast">
        {!isEditableState && (
          <InternetConnectionAlert
            isFailed={savingStatus === RequestStatus.FAILED}
            isQueryPending={isQueryPending}
            onQueryProcessing={handleQueryProcessing}
            onInternetConnectionFailed={handleInternetConnectionFailed}
          />
        )}
        <AlertMessage
          show={showModifiedAlert}
          aria-hidden={showModifiedAlert}
          aria-labelledby={intl.formatMessage(
            messages.alertWarningAriaLabelledby,
          )}
          aria-describedby={intl.formatMessage(
            messages.alertWarningAriaDescribedby,
          )}
          role="dialog"
          actions={[
            !isQueryPending && (
              <Button
                key="cancel-button"
                variant="tertiary"
                onClick={handleResetValues}
              >
                {intl.formatMessage(messages.buttonCancelText)}
              </Button>
            ),
            <StatefulButton
              key="save-button"
              onClick={handleUpdateValues}
              disabled={hasErrors}
              state={
                isQueryPending
                  ? STATEFUL_BUTTON_STATES.pending
                  : STATEFUL_BUTTON_STATES.default
              }
              {...updateValuesButtonState}
            />,
          ].filter(Boolean)}
          variant="warning"
          icon={WarningIcon}
          title={alertWhileSavingTitle}
          description={alertWhileSavingDescription}
        />
      </div>
    </>
  );
};

ScheduleAndDetails.propTypes = {
  intl: intlShape.isRequired,
  courseId: PropTypes.string.isRequired,
};

export default injectIntl(ScheduleAndDetails);
