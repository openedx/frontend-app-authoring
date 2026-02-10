import { getConfig } from '@edx/frontend-platform';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Helmet } from 'react-helmet';
import { Container, Stack } from '@openedx/paragon';
import { useCourseAuthoringContext } from '@src/CourseAuthoringContext';

import SubHeader from '../generic/sub-header/SubHeader';
import messages from './messages';
import AriaLiveRegion from './AriaLiveRegion';
import ChecklistSection from './ChecklistSection';
import ConnectionErrorAlert from '../generic/ConnectionErrorAlert';
import { useCourseBestPractices, useCourseLaunch } from './data/apiHooks';

const CourseChecklist = () => {
  const intl = useIntl();
  const { courseId, courseDetails } = useCourseAuthoringContext();
  const enableQuality = getConfig().ENABLE_CHECKLIST_QUALITY === 'true';

  const {
    data: bestPracticeData,
    isPending: isPendingBestPacticeData,
  } = useCourseBestPractices({ courseId });

  const {
    data: launchData,
    isPending: isPendingLaunchData,
    failureReason: launchError,
  } = useCourseLaunch({ courseId });

  const isLoadingDenied = launchError?.response?.status === 403;

  if (isLoadingDenied) {
    return (
      <Container size="xl" className="course-unit px-4 mt-4">
        <ConnectionErrorAlert />
      </Container>
    );
  }

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
            isCourseLaunchChecklistLoading: isPendingLaunchData,
            isCourseBestPracticeChecklistLoading: isPendingBestPacticeData,
            enableQuality,
          }}
        />
        <Stack gap={4}>
          <ChecklistSection
            courseId={courseId}
            dataHeading={intl.formatMessage(messages.launchChecklistLabel)}
            data={launchData}
            idPrefix="launchChecklist"
            isLoading={isPendingLaunchData}
          />
          {enableQuality && (
            <ChecklistSection
              courseId={courseId}
              dataHeading={intl.formatMessage(messages.bestPracticesChecklistLabel)}
              data={bestPracticeData}
              idPrefix="bestPracticesChecklist"
              isLoading={isPendingBestPacticeData}
            />
          )}
        </Stack>
      </Container>
    </>
  );
};

export default CourseChecklist;
