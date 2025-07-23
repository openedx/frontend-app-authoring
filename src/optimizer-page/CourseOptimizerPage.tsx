/* eslint-disable no-param-reassign */
import {
  useEffect, useState, useRef, FC, MutableRefObject,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Badge, Container, Layout, Button, Card,
} from '@openedx/paragon';
import { Helmet } from 'react-helmet';

import CourseStepper from '../generic/course-stepper';
import ConnectionErrorAlert from '../generic/ConnectionErrorAlert';
import SubHeader from '../generic/sub-header/SubHeader';
import { RequestFailureStatuses } from '../data/constants';
import messages from './messages';
import {
  getCurrentStage, getError, getLinkCheckInProgress, getLoadingStatus, getSavingStatus, getLinkCheckResult,
  getLastScannedAt,
} from './data/selectors';
import { startLinkCheck, fetchLinkCheckStatus } from './data/thunks';
import { useModel } from '../generic/model-store';
import ScanResults from './scan-results';

const pollLinkCheckStatus = (dispatch: any, courseId: string, delay: number): number => {
  const interval = setInterval(() => {
    dispatch(fetchLinkCheckStatus(courseId));
  }, delay);
  return interval as unknown as number;
};

export function pollLinkCheckDuringScan(
  linkCheckInProgress: boolean | null,
  interval: MutableRefObject<number | undefined>,
  dispatch: any,
  courseId: string,
) {
  if (linkCheckInProgress === null || linkCheckInProgress) {
    clearInterval(interval.current as number | undefined);
    interval.current = pollLinkCheckStatus(dispatch, courseId, 2000);
  } else if (interval.current) {
    clearInterval(interval.current);
    interval.current = undefined;
  }
}

const CourseOptimizerPage: FC<{ courseId: string }> = ({ courseId }) => {
  const dispatch = useDispatch();
  const linkCheckInProgress = useSelector(getLinkCheckInProgress);
  const loadingStatus = useSelector(getLoadingStatus);
  const savingStatus = useSelector(getSavingStatus);
  const currentStage = useSelector(getCurrentStage);
  const linkCheckResult = useSelector(getLinkCheckResult);
  const lastScannedAt = useSelector(getLastScannedAt);
  const { msg: errorMessage } = useSelector(getError);
  const isShowExportButton = !linkCheckInProgress || errorMessage;
  const isLoadingDenied = (RequestFailureStatuses as string[]).includes(loadingStatus);
  const isSavingDenied = (RequestFailureStatuses as string[]).includes(savingStatus);
  const interval = useRef<number | undefined>(undefined);
  const courseDetails = useModel('courseDetails', courseId);
  const linkCheckPresent = currentStage != null ? currentStage >= 0 : !!currentStage;
  const [showStepper, setShowStepper] = useState(false);

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

  useEffect(() => {
    // when first entering the page, fetch any existing scan results
    dispatch(fetchLinkCheckStatus(courseId));
  }, []);

  useEffect(() => {
    // when a scan starts, start polling for the results as long as the scan status fetched
    // signals it is still in progress
    pollLinkCheckDuringScan(linkCheckInProgress, interval, dispatch, courseId);

    return () => {
      if (interval.current) { clearInterval(interval.current); }
    };
  }, [linkCheckInProgress, linkCheckResult]);

  const stepperVisibleCondition = linkCheckPresent && ((!linkCheckResult || linkCheckInProgress) && currentStage !== 2);
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (stepperVisibleCondition) {
      setShowStepper(true);
    } else {
      timeout = setTimeout(() => {
        // ignoring below line as we didn't wrote tests for scanning process
        // istanbul ignore next
        setShowStepper(false);
      }, 2500);
    }

    return () => clearTimeout(timeout);
  }, [stepperVisibleCondition]);

  if (isLoadingDenied || isSavingDenied) {
    if (interval.current) { clearInterval(interval.current); }

    return (
    // <Container size="xl" className="course-unit px-4 mt-4">
      <ConnectionErrorAlert />
    // </Container>
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
                  hideBorder
                  title={
                    (
                      <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                        {intl.formatMessage(messages.headingTitle)}
                        <Badge variant="primary" className="ml-2" style={{ fontSize: 'large' }}>{intl.formatMessage(messages.new)}</Badge>
                      </span>
                    )
                  }
                  subtitle={intl.formatMessage(messages.headingSubtitle)}
                />
                <Card>
                  <Card.Header
                    className="scan-header h3 px-3 text-black mb-2"
                    title={intl.formatMessage(messages.card1Title)}
                  />
                  <p className="px-3 py-1 small ">{intl.formatMessage(messages.description)}</p>
                  {isShowExportButton && (
                  <Card.Section className="px-3 py-1">
                    <Button
                      size="md"
                      block
                      className="mb-3"
                      onClick={() => dispatch(startLinkCheck(courseId))}
                    >
                      {intl.formatMessage(messages.buttonTitle)}
                    </Button>
                    <p className="small"> {lastScannedAt && `${intl.formatMessage(messages.lastScannedOn)} ${intl.formatDate(lastScannedAt, { year: 'numeric', month: 'long', day: 'numeric' })}`}</p>
                  </Card.Section>
                  )}
                  {showStepper && (
                  <Card.Section className="px-3 py-1">
                    <CourseStepper
                      // @ts-ignore
                      steps={courseStepperSteps}
                      // @ts-ignore
                      activeKey={currentStage}
                      hasError={currentStage === 1 && !!errorMessage}
                      errorMessage={errorMessage}
                    />
                  </Card.Section>
                  )}
                </Card>
                {(linkCheckPresent && linkCheckResult) && <ScanResults data={linkCheckResult} />}
              </article>
            </Layout.Element>
          </Layout>
        </section>
      </Container>
    </>
  );
};

export default CourseOptimizerPage;
