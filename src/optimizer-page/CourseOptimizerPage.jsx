import React, { useEffect, useRef } from 'react';
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
  getCurrentStage, getError, getLinkCheckInProgress, getLoadingStatus, getSavingStatus,
} from './data/selectors';
import { startLinkCheck, fetchLinkCheckStatus } from './data/thunks';
import { LINK_CHECK_STATUSES, LINK_CHECK_IN_PROGRESS_STATUSES } from './data/constants';
import { updateSavingStatus, updateSuccessDate } from './data/slice';
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
  const linkCheckInProgress = useSelector(getLinkCheckInProgress);
  const savingStatus = useSelector(getSavingStatus);
  const loadingStatus = useSelector(getLoadingStatus);
  const courseDetails = useModel('courseDetails', courseId);
  const currentStage = useSelector(getCurrentStage);
  const { msg: errorMessage } = useSelector(getError);
  const isShowExportButton = !linkCheckInProgress || errorMessage;
  const anyRequestFailed = savingStatus === RequestStatus.FAILED || loadingStatus === RequestStatus.FAILED;
  const isLoadingDenied = loadingStatus === RequestStatus.DENIED;
  const anyRequestInProgress = savingStatus === RequestStatus.PENDING || loadingStatus === RequestStatus.IN_PROGRESS;
  const interval = useRef(null);

  console.log('linkCheckInProgress', linkCheckInProgress);

  useEffect(() => {
    dispatch(fetchLinkCheckStatus(courseId));
  }, []);

  useEffect(() => {
    if (linkCheckInProgress === null || linkCheckInProgress) {
      clearInterval(interval.current);
      interval.current = pollLinkCheckStatus(dispatch, courseId, 2000);
    } else if (interval.current) {
      clearInterval(interval.current);
      interval.current = null;
    }

    return () => {
      if (interval.current) { clearInterval(interval.current); }
    };
  }, [linkCheckInProgress]);

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
