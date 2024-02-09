import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { Container, Layout } from '@edx/paragon';
import { useIntl, injectIntl } from '@edx/frontend-platform/i18n';
import { ErrorAlert } from '@edx/frontend-lib-content-components';

import { getProcessingNotification } from '../generic/processing-notification/data/selectors';
import SubHeader from '../generic/sub-header/SubHeader';
import { RequestStatus } from '../data/constants';
import getPageHeadTitle from '../generic/utils';
import ProcessingNotification from '../generic/processing-notification';
import InternetConnectionAlert from '../generic/internet-connection-alert';
import Loading from '../generic/Loading';
import AddComponent from './add-component/AddComponent';
import HeaderTitle from './header-title/HeaderTitle';
import Breadcrumbs from './breadcrumbs/Breadcrumbs';
import HeaderNavigations from './header-navigations/HeaderNavigations';
import Sequence from './course-sequence';
import { useCourseUnit } from './hooks';
import messages from './messages';

const CourseUnit = ({ courseId }) => {
  const { blockId } = useParams();
  const intl = useIntl();
  const {
    isLoading,
    sequenceId,
    unitTitle,
    savingStatus,
    isTitleEditFormOpen,
    isInternetConnectionAlertFailed,
    handleTitleEditSubmit,
    headerNavigationsActions,
    handleTitleEdit,
    handleInternetConnectionFailed,
    handleCreateNewCourseXblock,
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
          <ErrorAlert hideHeading isError={savingStatus === RequestStatus.FAILED}>
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
              <Breadcrumbs
                courseId={courseId}
              />
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
          />
          <Layout
            lg={[{ span: 9 }, { span: 3 }]}
            md={[{ span: 9 }, { span: 3 }]}
            sm={[{ span: 9 }, { span: 3 }]}
            xs={[{ span: 9 }, { span: 3 }]}
            xl={[{ span: 9 }, { span: 3 }]}
          >
            <Layout.Element>
              <AddComponent
                blockId={blockId}
                handleCreateNewCourseXblock={handleCreateNewCourseXblock}
              />
            </Layout.Element>
            <Layout.Element />
          </Layout>
        </section>
      </Container>
      <div className="alert-toast">
        <ProcessingNotification
          isShow={isShowProcessingNotification}
          title={processingNotificationTitle}
        />
        <InternetConnectionAlert
          isFailed={isInternetConnectionAlertFailed}
          isQueryPending={savingStatus === RequestStatus.PENDING}
          onInternetConnectionFailed={handleInternetConnectionFailed}
        />
      </div>
    </>
  );
};

CourseUnit.propTypes = {
  courseId: PropTypes.string.isRequired,
};

export default injectIntl(CourseUnit);
