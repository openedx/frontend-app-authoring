import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { Container, Button, Layout } from '@edx/paragon';
import {
  CheckCircle as CheckCircleIcon,
  WarningFilled as WarningFilledIcon,
} from '@edx/paragon/icons';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import { RequestStatus } from '../data/constants';
import AlertMessage from '../generic/alert-message';
import Loading from '../generic/Loading';
import {
  fetchCourseSettingsQuery,
  fetchCourseDetailsQuery,
  updateCourseDetailsQuery,
} from './data/thunks';
import {
  getCourseSettings,
  getSavingStatus,
  getCourseDetails,
  getLoadingDetailsStatus,
  getLoadingSettingsStatus,
} from './data/selectors';
import BasicSection from './basic-section';
import CreditSection from './credit-section';
import PacingSection from './pacing-section';
import ScheduleSidebar from './schedule-sidebar';
import messages from './messages';
import { useSaveValuesPrompt } from './hooks';

const ScheduleAndDetails = ({ intl, courseId }) => {
  const courseSettings = useSelector(getCourseSettings);
  const courseDetails = useSelector(getCourseDetails);
  const savingStatus = useSelector(getSavingStatus);
  const loadingDetailsStatus = useSelector(getLoadingDetailsStatus);
  const loadingSettingsStatus = useSelector(getLoadingSettingsStatus);
  const isLoading = loadingDetailsStatus === RequestStatus.IN_PROGRESS
    || loadingSettingsStatus === RequestStatus.IN_PROGRESS;

  const {
    editedValues,
    saveValuesPrompt,
    dispatch,
    handleResetValues,
    handleValuesChange,
    handleUpdateValues,
  } = useSaveValuesPrompt(courseId, updateCourseDetailsQuery, courseDetails);

  const {
    creditEligibilityEnabled,
    isCreditCourse,
    lmsLinkForAboutPage,
    marketingEnabled,
    courseDisplayName,
    mfeProctoredExamSettingsUrl,
    platformName,
  } = courseSettings;

  const {
    org,
    courseId: courseNumber,
    run,
    startDate,
    selfPaced,
  } = editedValues;

  const showCreditSection = creditEligibilityEnabled && isCreditCourse;

  useEffect(() => {
    dispatch(fetchCourseSettingsQuery(courseId));
    dispatch(fetchCourseDetailsQuery(courseId));
  }, [courseId]);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <>
      <Container size="xl">
        <div className="mt-5">
          {savingStatus === RequestStatus.SUCCESSFUL && (
            <AlertMessage
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
          )}
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
        <AlertMessage
          show={saveValuesPrompt}
          aria-hidden={saveValuesPrompt}
          aria-labelledby={intl.formatMessage(
            messages.alertWarningAriaLabelledby,
          )}
          aria-describedby={intl.formatMessage(
            messages.alertWarningAriaDescribedby,
          )}
          role="dialog"
          actions={[
            <Button onClick={handleUpdateValues}>
              {intl.formatMessage(messages.buttonSaveText)}
            </Button>,
            <Button variant="tertiary" onClick={handleResetValues}>
              {intl.formatMessage(messages.buttonCancelText)}
            </Button>,
          ]}
          variant="warning"
          icon={WarningFilledIcon}
          title={intl.formatMessage(messages.alertWarning)}
          description={intl.formatMessage(messages.alertWarningDescriptions)}
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
