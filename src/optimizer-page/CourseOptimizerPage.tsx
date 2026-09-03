import { useEffect, useState } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Badge,
  Container,
  Layout,
  Card,
  Icon,
  StatefulButton,
} from '@openedx/paragon';
import { SpinnerSimple } from '@openedx/paragon/icons';
import { Helmet } from 'react-helmet';

import { useCourseAuthoringContext } from '@src/CourseAuthoringContext';
import { useCourseUserPermissions } from '@src/authz/hooks';
import { getCourseOutlinePermissions } from '@src/authz/permissionHelpers';
import CourseStepper from '../generic/course-stepper';
import ConnectionErrorAlert from '../generic/ConnectionErrorAlert';
import Loading from '@src/generic/Loading';
import PermissionDeniedAlert from '@src/generic/PermissionDeniedAlert';
import { STATEFUL_BUTTON_STATES } from '../constants';
import messages from './messages';
import {
  LINK_CHECK_FAILURE_STATUSES,
  LINK_CHECK_IN_PROGRESS_STATUSES,
  LINK_CHECK_STATUSES,
  SCAN_STAGES,
} from './data/constants';
import {
  useLinkCheckStatus,
  useStartLinkCheck,
} from './data/apiHooks';
import ScanResults from './scan-results';

const CourseOptimizerPage = () => {
  const { courseId, courseDetails } = useCourseAuthoringContext();
  const {
    isLoading: isLoadingUserPermissions,
    canEditCourseContent,
  } = useCourseUserPermissions(courseId, getCourseOutlinePermissions(courseId));
  const hasEditAccess = !isLoadingUserPermissions && canEditCourseContent;
  const intl = useIntl();
  const linkCheckStatusQuery = useLinkCheckStatus(courseId, { enabled: hasEditAccess });
  const startLinkCheckMutation = useStartLinkCheck(courseId);
  const linkCheckStatus = linkCheckStatusQuery.data?.linkCheckStatus;
  const linkCheckInProgress = startLinkCheckMutation.isPending
    || (linkCheckStatus != null && LINK_CHECK_IN_PROGRESS_STATUSES.includes(linkCheckStatus));
  const currentStage = startLinkCheckMutation.isPending
    ? SCAN_STAGES[LINK_CHECK_STATUSES.PENDING]
    : linkCheckStatus == null
    ? undefined
    : SCAN_STAGES[linkCheckStatus];
  const linkCheckResult = linkCheckStatus === LINK_CHECK_STATUSES.SUCCEEDED
    ? linkCheckStatusQuery.data?.linkCheckOutput ?? { sections: [] }
    : null;
  const lastScannedAt = linkCheckStatus === LINK_CHECK_STATUSES.SUCCEEDED
    ? linkCheckStatusQuery.data?.linkCheckCreatedAt
    : null;
  const errorMessage = linkCheckStatusQuery.isSuccess
      && !startLinkCheckMutation.isPending
      && (linkCheckStatus == null || LINK_CHECK_FAILURE_STATUSES.includes(linkCheckStatus))
    ? intl.formatMessage(messages.linkCheckFailed)
    : null;
  const linkCheckPresent = currentStage != null ? currentStage >= 0 : !!currentStage;
  const [showStepper, setShowStepper] = useState(false);
  const hasConnectionError = linkCheckStatusQuery.isError || startLinkCheckMutation.isError;
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

  if (isLoadingUserPermissions) {
    return <Loading />;
  }

  if (!canEditCourseContent) {
    return <PermissionDeniedAlert />;
  }

  if (hasConnectionError) {
    return <ConnectionErrorAlert />;
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
          <Layout>
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
                    onClick={() => startLinkCheckMutation.mutate()}
                    disabled={!!linkCheckInProgress && !errorMessage}
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
                        <p className="small">
                          {lastScannedAt &&
                            `${intl.formatMessage(messages.lastScannedOn)} ${
                              intl.formatDate(lastScannedAt, { year: 'numeric', month: 'long', day: 'numeric' })
                            }`}
                        </p>
                      </Card.Section>
                      <ScanResults
                        data={linkCheckResult}
                        courseId={courseId}
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
