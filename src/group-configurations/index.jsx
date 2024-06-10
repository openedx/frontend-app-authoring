import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Container, Layout, Stack, Row,
} from '@openedx/paragon';

import { LoadingSpinner } from '../generic/Loading';
import { useModel } from '../generic/model-store';
import SubHeader from '../generic/sub-header/SubHeader';
import getPageHeadTitle from '../generic/utils';
import ProcessingNotification from '../generic/processing-notification';
import { SavingErrorAlert } from '../generic/saving-error-alert';
import messages from './messages';
import ContentGroupsSection from './content-groups-section';
import ExperimentConfigurationsSection from './experiment-configurations-section';
import EnrollmentTrackGroupsSection from './enrollment-track-groups-section';
import GroupConfigurationSidebar from './group-configuration-sidebar';
import { useGroupConfigurations } from './hooks';
import ConnectionErrorAlert from '../generic/ConnectionErrorAlert';

const GroupConfigurations = ({ courseId }) => {
  const { formatMessage } = useIntl();
  const courseDetails = useModel('courseDetails', courseId);
  const {
    isLoading,
    savingStatus,
    errorMessage,
    contentGroupActions,
    experimentConfigurationActions,
    processingNotificationTitle,
    isShowProcessingNotification,
    groupConfigurations: {
      allGroupConfigurations,
      shouldShowEnrollmentTrack,
      shouldShowExperimentGroups,
      experimentGroupConfigurations,
    },
    isLoadingDenied,
  } = useGroupConfigurations(courseId);

  document.title = getPageHeadTitle(
    courseDetails?.name,
    formatMessage(messages.headingTitle),
  );

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

  const enrollmentTrackGroup = shouldShowEnrollmentTrack
    ? allGroupConfigurations[0]
    : null;
  const contentGroup = allGroupConfigurations?.[shouldShowEnrollmentTrack ? 1 : 0];

  return (
    <>
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
          savingStatus={savingStatus}
          errorMessage={errorMessage}
        />
        <ProcessingNotification
          isShow={isShowProcessingNotification}
          title={processingNotificationTitle}
        />
      </div>
    </>
  );
};

GroupConfigurations.propTypes = {
  courseId: PropTypes.string.isRequired,
};

export default GroupConfigurations;
