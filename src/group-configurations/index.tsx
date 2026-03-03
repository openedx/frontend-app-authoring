import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Container,
  Layout,
  Stack,
  Row,
} from '@openedx/paragon';
import { Helmet } from 'react-helmet';
import { useCourseAuthoringContext } from '@src/CourseAuthoringContext';
import { LoadingSpinner } from '@src/generic/Loading';
import SubHeader from '@src/generic/sub-header/SubHeader';
import getPageHeadTitle from '@src/generic/utils';
import { SavingErrorAlert } from '@src/generic/saving-error-alert';

import messages from './messages';
import ContentGroupsSection from './content-groups-section';
import ExperimentConfigurationsSection from './experiment-configurations-section';
import TeamGroupsSection from './team-groups-section';
import EnrollmentTrackGroupsSection from './enrollment-track-groups-section';
import GroupConfigurationSidebar from './group-configuration-sidebar';
import { useGroupConfigurations } from './hooks';
import ConnectionErrorAlert from '../generic/ConnectionErrorAlert';
import { AvailableGroup } from './types';

const GroupConfigurations = () => {
  const { formatMessage } = useIntl();
  const { courseId, courseDetails } = useCourseAuthoringContext();
  const {
    isLoading,
    anyMutationFailed,
    mutationErrorMessage,
    contentGroupActions,
    experimentConfigurationActions,
    groupConfigurations,
    isLoadingDenied,
  } = useGroupConfigurations();

  document.title = getPageHeadTitle(
    courseDetails?.name ?? '',
    formatMessage(messages.headingTitle),
  );
  const {
    shouldShowEnrollmentTrack = false,
    shouldShowExperimentGroups = false,
    experimentGroupConfigurations = [],
    allGroupConfigurations = [],
  } = groupConfigurations ?? {};

  if (isLoadingDenied) {
    return (
      <Container size="xl" className="course-unit px-4 mt-4">
        <ConnectionErrorAlert />
      </Container>
    );
  }

  if (isLoading) {
    return (
      <Row className="m-0 mt-4 justify-content-center">
        <LoadingSpinner />
      </Row>
    );
  }

  const enrollmentTrackGroup: AvailableGroup = shouldShowEnrollmentTrack
    ? allGroupConfigurations.find((group) => group.scheme === 'enrollment_track')
    : null;

  const contentGroup: AvailableGroup[] = allGroupConfigurations.find((group) => group.scheme === 'cohort');

  const teamGroups: AvailableGroup[] = allGroupConfigurations.filter((group) => group.scheme === 'team');

  return (
    <>
      <Helmet>
        <title>{getPageHeadTitle(courseDetails?.name ?? '', formatMessage(messages.headingTitle))}</title>
      </Helmet>
      <Container size="xl" className="group-configurations px-4">
        <div className="mt-5" />
        <SubHeader
          title={formatMessage(messages.headingTitle)}
          subtitle={formatMessage(messages.headingSubtitle)}
        />
        <Layout
          lg={[{ span: 9 }, { span: 3 }]}
          md={[{ span: 9 }, { span: 3 }]}
          sm={[{ span: 9 }, { span: 3 }]}
          xs={[{ span: 9 }, { span: 3 }]}
          xl={[{ span: 9 }, { span: 3 }]}
        >
          <Layout.Element>
            <Stack
              gap={3}
              data-testid="group-configurations-main-content-wrapper"
            >
              {!!teamGroups && teamGroups.length > 0 && (
                teamGroups.map((teamGroup) => (
                  <TeamGroupsSection
                    key={teamGroup.id}
                    availableGroup={teamGroup}
                  />
                ))
              )}
              {!!enrollmentTrackGroup && (
                <EnrollmentTrackGroupsSection
                  availableGroup={enrollmentTrackGroup}
                />
              )}
              {!!contentGroup && (
                <ContentGroupsSection
                  availableGroup={contentGroup}
                  contentGroupActions={contentGroupActions}
                />
              )}
              {shouldShowExperimentGroups && (
                <ExperimentConfigurationsSection
                  courseId={courseId}
                  availableGroups={experimentGroupConfigurations}
                  experimentConfigurationActions={experimentConfigurationActions}
                />
              )}
            </Stack>
          </Layout.Element>
          <Layout.Element>
            <GroupConfigurationSidebar
              courseId={courseId}
              shouldShowExperimentGroups={shouldShowExperimentGroups}
              shouldShowContentGroup={!!contentGroup}
              shouldShowEnrollmentTrackGroup={!!enrollmentTrackGroup}
            />
          </Layout.Element>
        </Layout>
      </Container>
      <div className="alert-toast">
        <SavingErrorAlert
          isQueryFailed={anyMutationFailed}
          errorMessage={mutationErrorMessage}
        />
      </div>
    </>
  );
};

export default GroupConfigurations;
