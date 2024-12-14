import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Container, Layout, Button, Card,
} from '@openedx/paragon';
import { Search as SearchIcon } from '@openedx/paragon/icons';
import { Helmet } from 'react-helmet';

import CourseStepper from '../generic/course-stepper';
import ConnectionErrorAlert from '../generic/ConnectionErrorAlert';
import SubHeader from '../generic/sub-header/SubHeader';
import { RequestStatus } from '../data/constants';
import messages from './messages';
import {
  getCurrentStage, getError, getLinkCheckInProgress, getLoadingStatus, getLinkCheckResult,
} from './data/selectors';
import { startLinkCheck, fetchLinkCheckStatus } from './data/thunks';
import { useModel } from '../generic/model-store';
import { ScanResults } from './scan-results';

const pollLinkCheckStatus = (dispatch, courseId, delay) => {
  const interval = setInterval(() => {
    dispatch(fetchLinkCheckStatus(courseId));
  }, delay);
  return interval;
};

const CourseOptimizerPage = ({ courseId }) => {
  const dispatch = useDispatch();
  const linkCheckInProgress = useSelector(getLinkCheckInProgress);
  const loadingStatus = useSelector(getLoadingStatus);
  const currentStage = useSelector(getCurrentStage);
  const linkCheckResult = useSelector(getLinkCheckResult);
  const { msg: errorMessage } = useSelector(getError);
  const isShowExportButton = !linkCheckInProgress || errorMessage;
  const isLoadingDenied = loadingStatus === RequestStatus.DENIED;
  const interval = useRef(null);
  const courseDetails = useModel('courseDetails', courseId);
  const linkCheckPresent = !!currentStage;
  const intl = useIntl();

  const courseStepperSteps = [
    {
      title: intl.formatMessage(messages.preparingStepTitle),
      description: intl.formatMessage(messages.preparingStepDescription),
      key: 'course-step-preparing',
    },
    {
      title: intl.formatMessage(messages.scanningStepTitle),
      description: intl.formatMessage(messages.scanningStepDescription),
      key: 'course-step-scanning',
    },
    {
      title: intl.formatMessage(messages.successStepTitle),
      description: intl.formatMessage(messages.successStepDescription),
      key: 'course-step-success',
    },
  ];

  const pollLinkCheckStatusDuringScan = () => {
    if (linkCheckInProgress === null || linkCheckInProgress || !linkCheckResult) {
      clearInterval(interval.current);
      interval.current = pollLinkCheckStatus(dispatch, courseId, 2000);
    } else if (interval.current) {
      clearInterval(interval.current);
      interval.current = null;
    }
  };

  useEffect(() => {
    dispatch(fetchLinkCheckStatus(courseId));
  }, []);

  useEffect(() => {
    pollLinkCheckStatusDuringScan();

    return () => {
      if (interval.current) { clearInterval(interval.current); }
    };
  }, [linkCheckInProgress, linkCheckResult]);

  if (isLoadingDenied) {
    if (interval.current) { clearInterval(interval.current); }

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
                  title={intl.formatMessage(messages.headingTitle)}
                  subtitle={intl.formatMessage(messages.headingSubtitle)}
                />
                <p className="small">{intl.formatMessage(messages.description1)}</p>
                <p className="small">{intl.formatMessage(messages.description2)}</p>
                <Card>
                  <Card.Header
                    className="h3 px-3 text-black mb-4"
                    title={intl.formatMessage(messages.card1Title)}
                  />
                  {isShowExportButton && (
                  <Card.Section className="px-3 py-1">
                    <Button
                      size="lg"
                      block
                      className="mb-4"
                      onClick={() => dispatch(startLinkCheck(courseId))}
                      iconBefore={SearchIcon}
                    >
                      {intl.formatMessage(messages.buttonTitle)}
                    </Button>
                  </Card.Section>
                  )}
                  {linkCheckPresent && (
                  <Card.Section className="px-3 py-1">
                    <CourseStepper
                      steps={courseStepperSteps}
                      activeKey={currentStage}
                      hasError={currentStage < 0 || !!errorMessage}
                      errorMessage={errorMessage}
                    />
                  </Card.Section>
                  )}
                </Card>
                {linkCheckPresent && <ScanResults data={linkCheckResult} />}
              </article>
            </Layout.Element>
          </Layout>
        </section>
      </Container>
    </>
  );
};

export default CourseOptimizerPage;
