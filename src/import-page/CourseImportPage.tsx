import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Container, Layout,
} from '@openedx/paragon';

import { Helmet } from 'react-helmet';

import SubHeader from '@src/generic/sub-header/SubHeader';
import InternetConnectionAlert from '@src/generic/internet-connection-alert';
import ConnectionErrorAlert from '@src/generic/ConnectionErrorAlert';
import { useCourseAuthoringContext } from '@src/CourseAuthoringContext';

import ImportStepper from './import-stepper/ImportStepper';
import ImportSidebar from './import-sidebar/ImportSidebar';
import FileSection from './file-section/FileSection';
import messages from './messages';
import { useCourseImportContext } from './CourseImportContext';

const CourseImportPage = () => {
  const intl = useIntl();
  const { courseDetails } = useCourseAuthoringContext();
  const {
    importTriggered,
    anyRequestFailed,
    anyRequestInProgress,
    isLoadingDenied,
  } = useCourseImportContext();

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
      <Container size="xl" className="mt-4 px-4 import">
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
                <p className="small">{intl.formatMessage(messages.description3)}</p>
                <FileSection />
                {importTriggered && <ImportStepper />}
              </article>
            </Layout.Element>
            <Layout.Element>
              <ImportSidebar />
            </Layout.Element>
          </Layout>
        </section>
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

export default CourseImportPage;
