import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { Container, Layout, Stack } from '@openedx/paragon';
import { useIntl, injectIntl } from '@edx/frontend-platform/i18n';
import { ErrorAlert } from '@edx/frontend-lib-content-components';
import { Warning as WarningIcon } from '@openedx/paragon/icons';

import { getProcessingNotification } from '../generic/processing-notification/data/selectors';
import SubHeader from '../generic/sub-header/SubHeader';
import { RequestStatus } from '../data/constants';
import getPageHeadTitle from '../generic/utils';
import AlertMessage from '../generic/alert-message';
import ProcessingNotification from '../generic/processing-notification';
import InternetConnectionAlert from '../generic/internet-connection-alert';
import ConnectionErrorAlert from '../generic/ConnectionErrorAlert';
import Loading from '../generic/Loading';
import AddComponent from './add-component/AddComponent';
import CourseXBlock from './course-xblock/CourseXBlock';
import HeaderTitle from './header-title/HeaderTitle';
import Breadcrumbs from './breadcrumbs/Breadcrumbs';
import HeaderNavigations from './header-navigations/HeaderNavigations';
import Sequence from './course-sequence';
import Sidebar from './sidebar';
import { useCourseUnit } from './hooks';
import messages from './messages';
import PublishControls from './sidebar/PublishControls';
import LocationInfo from './sidebar/LocationInfo';
import TagsSidebarControls from '../content-tags-drawer/tags-sidebar-controls';
import { PasteNotificationAlert, PasteComponent } from './clipboard';

const CourseUnit = ({ courseId }) => {
  const { blockId } = useParams();
  const intl = useIntl();
  const {
    isLoading,
    sequenceId,
    unitTitle,
    isQueryPending,
    sequenceStatus,
    savingStatus,
    isTitleEditFormOpen,
    isErrorAlert,
    staticFileNotices,
    currentlyVisibleToStudents,
    isInternetConnectionAlertFailed,
    unitXBlockActions,
    sharedClipboardData,
    showPasteXBlock,
    showPasteUnit,
    handleTitleEditSubmit,
    headerNavigationsActions,
    handleTitleEdit,
    handleInternetConnectionFailed,
    handleCreateNewCourseXBlock,
    handleConfigureSubmit,
    courseVerticalChildren,
    canPasteComponent,
  } = useCourseUnit({ courseId, blockId });

  document.title = getPageHeadTitle('', unitTitle);

  const {
    isShow: isShowProcessingNotification,
    title: processingNotificationTitle,
  } = useSelector(getProcessingNotification);

  if (isLoading) {
    return <Loading />;
  }

  if (sequenceStatus === RequestStatus.FAILED) {
    return (
      <Container size="xl" className="course-unit px-4 mt-4">
        <ConnectionErrorAlert />
      </Container>
    );
  }

  return (
    <>
      <Container size="xl" className="course-unit px-4">
        <section className="course-unit-container mb-4 mt-5">
          <ErrorAlert hideHeading isError={savingStatus === RequestStatus.FAILED && isErrorAlert}>
            {intl.formatMessage(messages.alertFailedGeneric, { actionName: 'save', type: 'changes' })}
          </ErrorAlert>
          <SubHeader
            hideBorder
            title={(
              <HeaderTitle
                unitTitle={unitTitle}
                isTitleEditFormOpen={isTitleEditFormOpen}
                handleTitleEdit={handleTitleEdit}
                handleTitleEditSubmit={handleTitleEditSubmit}
                handleConfigureSubmit={handleConfigureSubmit}
              />
            )}
            breadcrumbs={(
              <Breadcrumbs />
            )}
            headerActions={(
              <HeaderNavigations
                headerNavigationsActions={headerNavigationsActions}
              />
            )}
          />
          <Sequence
            courseId={courseId}
            sequenceId={sequenceId}
            unitId={blockId}
            handleCreateNewCourseXBlock={handleCreateNewCourseXBlock}
            showPasteUnit={showPasteUnit}
          />
          <Layout
            lg={[{ span: 8 }, { span: 4 }]}
            md={[{ span: 8 }, { span: 4 }]}
            sm={[{ span: 8 }, { span: 3 }]}
            xs={[{ span: 9 }, { span: 3 }]}
            xl={[{ span: 9 }, { span: 3 }]}
          >
            <Layout.Element>
              {currentlyVisibleToStudents && (
                <AlertMessage
                  title={intl.formatMessage(messages.alertUnpublishedVersion)}
                  variant="warning"
                  icon={WarningIcon}
                />
              )}
              {staticFileNotices && (
                <PasteNotificationAlert
                  staticFileNotices={staticFileNotices}
                  courseId={courseId}
                />
              )}
              <Stack gap={4} className="mb-4">
                {courseVerticalChildren.children.map(({
                  name, blockId: id, blockType: type, shouldScroll, userPartitionInfo, validationMessages,
                }) => (
                  <CourseXBlock
                    id={id}
                    key={id}
                    title={name}
                    type={type}
                    blockId={blockId}
                    validationMessages={validationMessages}
                    shouldScroll={shouldScroll}
                    unitXBlockActions={unitXBlockActions}
                    handleConfigureSubmit={handleConfigureSubmit}
                    data-testid="course-xblock"
                    userPartitionInfo={userPartitionInfo}
                  />
                ))}
              </Stack>
              <AddComponent
                blockId={blockId}
                handleCreateNewCourseXBlock={handleCreateNewCourseXBlock}
              />
              {showPasteXBlock && canPasteComponent && (
                <PasteComponent
                  clipboardData={sharedClipboardData}
                  handleCreateNewCourseXBlock={handleCreateNewCourseXBlock}
                />
              )}
            </Layout.Element>
            <Layout.Element>
              <Stack gap={3}>
                <Sidebar data-testid="course-unit-sidebar">
                  <PublishControls blockId={blockId} />
                </Sidebar>
                <Sidebar className="tags-sidebar">
                  <TagsSidebarControls />
                </Sidebar>
                <Sidebar data-testid="course-unit-location-sidebar">
                  <LocationInfo />
                </Sidebar>
              </Stack>
            </Layout.Element>
          </Layout>
        </section>
      </Container>
      <div className="alert-toast">
        <ProcessingNotification
          isShow={isShowProcessingNotification}
          title={processingNotificationTitle}
        />
        {isQueryPending && (
          <InternetConnectionAlert
            isFailed={isInternetConnectionAlertFailed}
            isQueryPending={savingStatus === RequestStatus.PENDING}
            onInternetConnectionFailed={handleInternetConnectionFailed}
          />
        )}
      </div>
    </>
  );
};

CourseUnit.propTypes = {
  courseId: PropTypes.string.isRequired,
};

export default injectIntl(CourseUnit);
