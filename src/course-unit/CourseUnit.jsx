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

const CourseUnit = ({ courseId }) => {
  const { blockId } = useParams();
  const intl = useIntl();
  const {
    isLoading,
    sequenceId,
    unitTitle,
    isQueryPending,
    savingStatus,
    isTitleEditFormOpen,
    isErrorAlert,
    isLastUnpublishedVersion,
    isInternetConnectionAlertFailed,
    unitXBlockActions,
    handleTitleEditSubmit,
    headerNavigationsActions,
    handleTitleEdit,
    handleInternetConnectionFailed,
    handleCreateNewCourseXBlock,
    courseVerticalChildren,
  } = useCourseUnit({ courseId, blockId });

  document.title = getPageHeadTitle('', unitTitle);

  const {
    isShow: isShowProcessingNotification,
    title: processingNotificationTitle,
  } = useSelector(getProcessingNotification);

  if (isLoading) {
    return <Loading />;
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
          />
          <Layout
            lg={[{ span: 8 }, { span: 4 }]}
            md={[{ span: 8 }, { span: 4 }]}
            sm={[{ span: 8 }, { span: 3 }]}
            xs={[{ span: 9 }, { span: 3 }]}
            xl={[{ span: 9 }, { span: 3 }]}
          >
            <Layout.Element>
              {isLastUnpublishedVersion && (
                <AlertMessage
                  title={intl.formatMessage(messages.alertUnpublishedVersion)}
                  variant="warning"
                  icon={WarningIcon}
                />
              )}
              <Stack gap={4} className="mb-4">
                {courseVerticalChildren.children.map(({ name, blockId: id, shouldScroll }) => (
                  <CourseXBlock
                    id={id}
                    key={id}
                    title={name}
                    shouldScroll={shouldScroll}
                    unitXBlockActions={unitXBlockActions}
                    data-testid="course-xblock"
                  />
                ))}
              </Stack>
              <AddComponent
                blockId={blockId}
                handleCreateNewCourseXBlock={handleCreateNewCourseXBlock}
              />
            </Layout.Element>
            <Layout.Element>
              <Stack gap={3}>
                <Sidebar blockId={blockId} data-testid="course-unit-sidebar" />
                <Sidebar isDisplayUnitLocation data-testid="course-unit-location-sidebar" />
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
