import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Container,
  Layout,
  Button,
  Card,
} from '@openedx/paragon';
import { ArrowCircleDown as ArrowCircleDownIcon } from '@openedx/paragon/icons';
import { getConfig } from '@edx/frontend-platform';
import { Helmet } from 'react-helmet';

import { useCourseAuthoringContext } from '@src/CourseAuthoringContext';
import InternetConnectionAlert from '@src/generic/internet-connection-alert';
import ConnectionErrorAlert from '@src/generic/ConnectionErrorAlert';
import SubHeader from '@src/generic/sub-header/SubHeader';

import messages from './messages';
import ExportSidebar from './export-sidebar/ExportSidebar';
import { EXPORT_STAGES } from './data/constants';
import ExportModalError from './export-modal-error/ExportModalError';
import ExportFooter from './export-footer/ExportFooter';
import ExportStepper from './export-stepper/ExportStepper';
import { useCourseExportContext } from './CourseExportContext';

const CourseExportPage = () => {
  const intl = useIntl();
  const { courseDetails } = useCourseAuthoringContext();
  const {
    currentStage,
    exportTriggered,
    fetchExportErrorMessage,
    anyRequestFailed,
    isLoadingDenied,
    anyRequestInProgress,
    handleStartExportingCourse,
  } = useCourseExportContext();

  const isShowExportButton = !exportTriggered || fetchExportErrorMessage || currentStage === EXPORT_STAGES.SUCCESS;

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
                <p className="small">
                  {intl.formatMessage(messages.description1, { studioShortName: getConfig().STUDIO_SHORT_NAME })}
                </p>
                <p className="small">{intl.formatMessage(messages.description2)}</p>
                <Card>
                  <Card.Header
                    className="h3 px-3 text-black mb-4"
                    title={intl.formatMessage(messages.titleUnderButton)}
                  />
                  {isShowExportButton && (
                    <Card.Section className="px-3 py-1">
                      <Button
                        size="lg"
                        block
                        className="mb-4"
                        onClick={handleStartExportingCourse}
                        iconBefore={ArrowCircleDownIcon}
                      >
                        {intl.formatMessage(messages.buttonTitle)}
                      </Button>
                    </Card.Section>
                  )}
                </Card>
                {exportTriggered && <ExportStepper />}
                <ExportFooter />
              </article>
            </Layout.Element>
            <Layout.Element>
              <ExportSidebar />
            </Layout.Element>
          </Layout>
        </section>
        <ExportModalError />
      </Container>
      <div className="alert-toast">
        <InternetConnectionAlert
          isFailed={anyRequestFailed}
          isQueryPending={anyRequestInProgress}
          onInternetConnectionFailed={() => null}
        />
      </div>
    </>
  );
};

export default CourseExportPage;
