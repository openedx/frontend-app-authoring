import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import {
  Container, Layout, Button, Card,
} from '@openedx/paragon';
import { ArrowCircleDown as ArrowCircleDownIcon } from '@openedx/paragon/icons';
import Cookies from 'universal-cookie';
import { getConfig } from '@edx/frontend-platform';
import { Helmet } from 'react-helmet';

import InternetConnectionAlert from '../generic/internet-connection-alert';
import ConnectionErrorAlert from '../generic/ConnectionErrorAlert';
import SubHeader from '../generic/sub-header/SubHeader';
import { RequestStatus } from '../data/constants';
import { useModel } from '../generic/model-store';
// import messages from './messages';
// import ExportSidebar from './export-sidebar/ExportSidebar';
import {
  getCurrentStage, getError, getLinkCheckTriggered, getLoadingStatus, getSavingStatus,
} from './data/selectors';
import { startLinkCheck, fetchLinkCheckStatus } from './data/thunks';
import { LINK_CHECK_STATUSES, LAST_EXPORT_COOKIE_NAME } from './data/constants';
import { updateLinkCheckTriggered, updateSavingStatus, updateSuccessDate } from './data/slice';
// import ExportModalError from './export-modal-error/ExportModalError';
// import ExportFooter from './export-footer/ExportFooter';
// import ExportStepper from './export-stepper/ExportStepper';

const pollLinkCheckStatus = (dispatch, courseId, delay) => {
  const interval = setInterval(() => {
    dispatch(fetchLinkCheckStatus(courseId));
  }, delay);
  return interval;
};

const CourseOptimizerPage = ({ intl, courseId }) => {
  const dispatch = useDispatch();
  const linkCheckTriggered = useSelector(getLinkCheckTriggered);
  const courseDetails = useModel('courseDetails', courseId);
  const currentStage = useSelector(getCurrentStage);
  const { msg: errorMessage } = useSelector(getError);
  const loadingStatus = useSelector(getLoadingStatus);
  const savingStatus = useSelector(getSavingStatus);
  const isShowExportButton = !linkCheckTriggered || errorMessage || currentStage === LINK_CHECK_STATUSES.SUCCESS;
  const anyRequestFailed = savingStatus === RequestStatus.FAILED || loadingStatus === RequestStatus.FAILED;
  const isLoadingDenied = loadingStatus === RequestStatus.DENIED;
  const anyRequestInProgress = savingStatus === RequestStatus.PENDING || loadingStatus === RequestStatus.IN_PROGRESS;

  useEffect(() => {
    // load link check status immediately after the page is loaded
    dispatch(fetchLinkCheckStatus(courseId));

    // start polling link check status every two seconds
    const intervalId = pollLinkCheckStatus(dispatch, courseId, 2000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

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
          Title
        </title>
      </Helmet>
      <Container size="xl" className="mt-4 px-4 export">
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
                <SubHeader
                  title="Title"
                  subtitle="Subtitle"
                />
                <p className="small">Small</p>
                <p className="small">Description</p>
                <Card>
                  <Card.Header
                    className="h3 px-3 text-black mb-4"
                    title="title"
                  />
                  {isShowExportButton && (
                  <Card.Section className="px-3 py-1">
                    <Button
                      size="lg"
                      block
                      className="mb-4"
                      onClick={() => dispatch(startLinkCheck(courseId))}
                      iconBefore={ArrowCircleDownIcon}
                    >
                      Scan for broken links
                    </Button>
                  </Card.Section>
                  )}
                  <h3>Current stage: {currentStage}</h3>
                </Card>
              </article>
            </Layout.Element>
          </Layout>
        </section>
      </Container>
    </>
  );
};

CourseOptimizerPage.propTypes = {
  intl: intlShape.isRequired,
  courseId: PropTypes.string.isRequired,
};

CourseOptimizerPage.defaultProps = {};
export default injectIntl(CourseOptimizerPage);
