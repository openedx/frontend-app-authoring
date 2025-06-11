/* eslint-disable react/prop-types */
import { Container, Stack } from '@openedx/paragon';
import AriaLiveRegion from '../course-checklist/AriaLiveRegion';
import ChecklistSection from '../course-checklist/ChecklistSection';
import SubHeader from '../generic/sub-header/SubHeader';

const CourseChecklistCustom = ({
//   courseId,
//   courseDetails,
  enableQuality,
  updateLinks,
  //   loadingStatus,
  launchData,
  bestPracticeData,
  isCourseLaunchChecklistLoading,
  isCourseBestPracticeChecklistLoading,
  //   intl,
  //   messages,
  //   formatMessage,
  launchChecklistLabel,
  bestPracticesChecklistLabel,
  //   headingSubtitle,
  headingTitle,
}) => (
  <Container size="xl" className="custom-checklist-container">
    <SubHeader
      title={headingTitle}
    //   subtitle={headingSubtitle}
    />
    <hr className="custom-checklist-divider" style={{ border: 'none', borderTop: '1px solid #e5e6e6', margin: '0 0 0 0' }} />
    <AriaLiveRegion
      {...{
        isCourseLaunchChecklistLoading,
        isCourseBestPracticeChecklistLoading,
        enableQuality,
      }}
    />
    <Stack gap={4} className="custom-checklist-sections">
      <ChecklistSection
        dataHeading={launchChecklistLabel}
        data={launchData}
        idPrefix="launchChecklist"
        isLoading={isCourseLaunchChecklistLoading}
        updateLinks={updateLinks}
      />
      {enableQuality && (
        <ChecklistSection
          dataHeading={bestPracticesChecklistLabel}
          data={bestPracticeData}
          idPrefix="bestPracticesChecklist"
          isLoading={isCourseBestPracticeChecklistLoading}
          updateLinks={updateLinks}
        />
      )}
    </Stack>
  </Container>
);

export default CourseChecklistCustom;
