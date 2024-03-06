import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { getConfig } from '@edx/frontend-platform';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Helmet } from 'react-helmet';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Stack } from '@openedx/paragon';

import { useModel } from '../generic/model-store';
import SubHeader from '../generic/sub-header/SubHeader';
import messages from './messages';
import AriaLiveRegion from './AriaLiveRegion';
import { RequestStatus } from '../data/constants';
import ChecklistSection from './ChecklistSection';
import { fetchCourseLaunchQuery, fetchCourseBestPracticesQuery } from './data/thunks';
import getUpdateLinks from './utils';

const CourseChecklist = ({
  courseId,
  // injected,
  intl,
}) => {
  const dispatch = useDispatch();
  const courseDetails = useModel('courseDetails', courseId);
  const enableQuality = getConfig().ENABLE_CHECKLIST_QUALITY === 'true';
  const updateLinks = getUpdateLinks(courseId);

  useEffect(() => {
    dispatch(fetchCourseLaunchQuery({ courseId }));
    dispatch(fetchCourseBestPracticesQuery({ courseId }));
  }, [courseId]);

  const {
    loadingStatus,
    launchData,
    bestPracticeData,
  } = useSelector(state => state.courseChecklist);

  const { bestPracticeChecklistLoadingStatus, launchChecklistLoadingStatus } = loadingStatus;

  const isCourseLaunchChecklistLoading = bestPracticeChecklistLoadingStatus === RequestStatus.IN_PROGRESS;
  const isCourseBestPracticeChecklistLoading = launchChecklistLoadingStatus === RequestStatus.IN_PROGRESS;

  return (
    <>
      <Helmet>
        <title>
          {intl.formatMessage(messages.pageTitle, {
            headingTitle: intl.formatMessage(messages.headingTitle),
            courseName: courseDetails?.name,
            siteName: process.env.SITE_NAME,
          })}
        </title>
      </Helmet>
      <Container size="xl" className="p-4 pt-4.5">
        <SubHeader
          title={intl.formatMessage(messages.headingTitle)}
          subtitle={intl.formatMessage(messages.headingSubtitle)}
        />
        <AriaLiveRegion
          {...{
            isCourseLaunchChecklistLoading,
            isCourseBestPracticeChecklistLoading,
            enableQuality,
          }}
        />
        <Stack gap={4}>
          <ChecklistSection
            dataHeading={intl.formatMessage(messages.launchChecklistLabel)}
            data={launchData}
            idPrefix="launchChecklist"
            isLoading={isCourseLaunchChecklistLoading}
            updateLinks={updateLinks}
          />
          {enableQuality && (
            <ChecklistSection
              dataHeading={intl.formatMessage(messages.bestPracticesChecklistLabel)}
              data={bestPracticeData}
              idPrefix="bestPracticesChecklist"
              isLoading={isCourseBestPracticeChecklistLoading}
              updateLinks={updateLinks}
            />
          )}
        </Stack>
      </Container>
    </>
  );
};

CourseChecklist.propTypes = {
  courseId: PropTypes.string.isRequired,
  // injected
  intl: intlShape.isRequired,
};

export default injectIntl(CourseChecklist);
