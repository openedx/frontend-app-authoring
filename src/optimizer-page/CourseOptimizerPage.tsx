/* eslint-disable no-param-reassign */
import {
  useEffect, useState, useRef, FC, MutableRefObject,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Badge, Container, Layout, Card, Icon, StatefulButton,
} from '@openedx/paragon';
import { SpinnerSimple } from '@openedx/paragon/icons';
import { Helmet } from 'react-helmet';

import CourseStepper from '../generic/course-stepper';
import ConnectionErrorAlert from '../generic/ConnectionErrorAlert';
import AlertMessage from '../generic/alert-message';
import { RequestFailureStatuses } from '../data/constants';
import { RERUN_LINK_UPDATE_STATUSES } from './data/constants';
import { STATEFUL_BUTTON_STATES } from '../constants';
import messages from './messages';
import {
  getCurrentStage, getError, getLinkCheckInProgress, getLoadingStatus, getSavingStatus, getLinkCheckResult,
  getLastScannedAt, getRerunLinkUpdateInProgress, getRerunLinkUpdateResult,
} from './data/selectors';
import { startLinkCheck, fetchLinkCheckStatus, fetchRerunLinkUpdateStatus } from './data/thunks';
import { useModel } from '../generic/model-store';
import ScanResults from './scan-results';

const pollLinkCheckStatus = (dispatch: any, courseId: string, delay: number): number => {
  const interval = setInterval(() => {
    dispatch(fetchLinkCheckStatus(courseId));
  }, delay);
  return interval as unknown as number;
};

export const pollRerunLinkUpdateStatus = (dispatch: any, courseId: string, delay: number): number => {
  const interval = setInterval(() => {
    dispatch(fetchRerunLinkUpdateStatus(courseId));
  }, delay);
  return interval as unknown as number;
};

export function pollRerunLinkUpdateDuringUpdate(
  rerunLinkUpdateInProgress: boolean | null,
  rerunLinkUpdateResult: any,
  interval: MutableRefObject<number | undefined>,
  dispatch: any,
  courseId: string,
) {
  const shouldPoll = rerunLinkUpdateInProgress === true
    || (rerunLinkUpdateResult && rerunLinkUpdateResult.status
      && rerunLinkUpdateResult.status !== RERUN_LINK_UPDATE_STATUSES.SUCCEEDED);

  if (shouldPoll) {
    clearInterval(interval.current as number | undefined);
    interval.current = pollRerunLinkUpdateStatus(dispatch, courseId, 2000);
  } else if (interval.current) {
    clearInterval(interval.current);
    interval.current = undefined;
  }
}

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
  const rerunLinkUpdateInProgress = useSelector(getRerunLinkUpdateInProgress);
  const rerunLinkUpdateResult = useSelector(getRerunLinkUpdateResult);
  const loadingStatus = useSelector(getLoadingStatus);
  const savingStatus = useSelector(getSavingStatus);
  const currentStage = useSelector(getCurrentStage);
  const linkCheckResult = useSelector(getLinkCheckResult);
  const lastScannedAt = useSelector(getLastScannedAt);
  const { msg: errorMessage } = useSelector(getError);
  const isLoadingDenied = (RequestFailureStatuses as string[]).includes(loadingStatus);
  const interval = useRef<number | undefined>(undefined);
  const rerunUpdateInterval = useRef<number | undefined>(undefined);
  const courseDetails = useModel('courseDetails', courseId);
  const linkCheckPresent = currentStage != null ? currentStage >= 0 : !!currentStage;
  const [showStepper, setShowStepper] = useState(false);
  const [scanResultsError, setScanResultsError] = useState<string | null>(null);
  const isSavingDenied = (RequestFailureStatuses as string[]).includes(savingStatus) && !errorMessage;
  const intl = useIntl();
  const getScanButtonState = () => {
    if (linkCheckInProgress && !errorMessage) {
      return STATEFUL_BUTTON_STATES.pending;
    }
    return STATEFUL_BUTTON_STATES.default;
  };
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

  useEffect(() => {
    pollRerunLinkUpdateDuringUpdate(
      rerunLinkUpdateInProgress,
      rerunLinkUpdateResult,
      rerunUpdateInterval,
      dispatch,
      courseId,
    );

    return () => {
      if (rerunUpdateInterval.current) { clearInterval(rerunUpdateInterval.current); }
    };
  }, [rerunLinkUpdateInProgress, rerunLinkUpdateResult]);

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
    if (rerunUpdateInterval.current) { clearInterval(rerunUpdateInterval.current); }

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
      {scanResultsError && (
        <AlertMessage
          variant="danger"
          title=""
          description={scanResultsError}
          dismissible
          show={!!scanResultsError}
          onClose={() => setScanResultsError(null)}
          className="mt-3"
        />
      )}
      <Container size="xl" className="mt-4 px-4 export">
        <section className="setting-items mb-4">
          <Layout
            lg={[{ span: 12 }, { span: 0 }]}
          >
            <Layout.Element>
              <article>
                <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 p-3">
                  <div>
                    <p className="small text-muted mb-1">Tools</p>
                    <div className="d-flex align-items-center">
                      <h1 className="h2 mb-0 mr-3">{intl.formatMessage(messages.headingTitle)}</h1>
                      <Badge variant="primary" className="ml-2">{intl.formatMessage(messages.new)}</Badge>
                    </div>
                  </div>
                  <StatefulButton
                    className="px-4 rounded-0 scan-course-btn"
                    labels={{
                      default: intl.formatMessage(messages.buttonTitle),
                      pending: intl.formatMessage(messages.buttonTitle),
                    }}
                    icons={{
                      default: '',
                      pending: <Icon src={SpinnerSimple} className="icon-spin" />,
                    }}
                    state={getScanButtonState()}
                    onClick={() => dispatch(startLinkCheck(courseId))}
                    disabled={!!(linkCheckInProgress) && !errorMessage}
                    variant="primary"
                    data-testid="scan-course"
                  />
                </div>
                <Card className="scan-card">
                  <p className="px-3 py-1 small">{intl.formatMessage(messages.description)}</p>
                  <hr />
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
                  {linkCheckPresent && linkCheckResult && (
                    <>
                      <Card.Header
                        className="scan-header h3 px-3 text-black mb-2"
                        title={intl.formatMessage(messages.scanHeader)}
                      />
                      <Card.Section className="px-3 py-1">
                        <p className="small"> {lastScannedAt && `${intl.formatMessage(messages.lastScannedOn)} ${intl.formatDate(lastScannedAt, { year: 'numeric', month: 'long', day: 'numeric' })}`}</p>
                      </Card.Section>
                      <ScanResults
                        data={linkCheckResult}
                        courseId={courseId}
                        onErrorStateChange={setScanResultsError}
                        rerunLinkUpdateInProgress={rerunLinkUpdateInProgress}
                        rerunLinkUpdateResult={rerunLinkUpdateResult}
                      />
                    </>
                  )}
                </Card>
              </article>
            </Layout.Element>
          </Layout>
        </section>
      </Container>
    </>
  );
};

export default CourseOptimizerPage;
