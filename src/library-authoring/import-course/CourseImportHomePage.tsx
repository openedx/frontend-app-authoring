import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import {
  Button,
  Card,
  Container,
  Layout,
  Stack,
} from '@openedx/paragon';
import { Add } from '@openedx/paragon/icons';
import { getConfig } from '@edx/frontend-platform';
import { useIntl, FormattedMessage } from '@edx/frontend-platform/i18n';
import Loading from '@src/generic/Loading';
import SubHeader from '@src/generic/sub-header/SubHeader';
import Header from '@src/header';

import { useLibraryContext } from '../common/context/LibraryContext';
import { useCourseImports } from '../data/apiHooks';
import { HelpSidebar } from './HelpSidebar';
import { ImportedCourseCard } from './ImportedCourseCard';
import messages from './messages';

const EmptyState = () => (
  <Container size="md" className="py-6">
    <Card>
      <Stack direction="horizontal" gap={3} className="my-6 justify-content-center">
        <FormattedMessage {...messages.emptyStateText} />
        <Button iconBefore={Add} disabled>
          <FormattedMessage {...messages.emptyStateButtonText} />
        </Button>
      </Stack>
    </Card>
  </Container>
);

export const CourseImportHomePage = () => {
  const intl = useIntl();
  const navigate = useNavigate();
  const { libraryId, libraryData, readOnly } = useLibraryContext();
  const { data: courseImports } = useCourseImports(libraryId);

  if (!courseImports || !libraryData) {
    return <Loading />;
  }

  return (
    <div className="d-flex">
      <div className="flex-grow-1">
        <Helmet>
          <title>{libraryData.title} | {process.env.SITE_NAME}</title>
        </Helmet>
        <Header
          number={libraryData.slug}
          title={libraryData.title}
          org={libraryData.org}
          contextId={libraryId}
          isLibrary
          readOnly={readOnly}
          containerProps={{
            size: undefined,
          }}
        />
        <Container className="mt-4 mb-5">
          <div className="px-4 bg-light-200 border-bottom">
            <SubHeader
              title={intl.formatMessage(messages.pageTitle)}
              subtitle={intl.formatMessage(messages.pageSubtitle)}
              hideBorder
              headerActions={
                getConfig().ENABLE_COURSE_IMPORT_IN_LIBRARY === 'true' && (
                  <Button onClick={() => navigate('courses')}>
                    {intl.formatMessage(messages.importCourseButton)}
                  </Button>
                )
              }
            />
          </div>
          <Layout xs={[{ span: 9 }, { span: 3 }]}>
            <Layout.Element>
              {courseImports.length ? (
                <Stack gap={3} className="pl-4 mt-4">
                  <h3>
                    <FormattedMessage {...messages.courseImportPreviousImports} />
                  </h3>
                  {courseImports.map((courseImport) => (
                    <ImportedCourseCard
                      key={courseImport.source.key}
                      courseImport={courseImport}
                    />
                  ))}
                </Stack>
              ) : (<EmptyState />)}
            </Layout.Element>
            <Layout.Element>
              <HelpSidebar />
            </Layout.Element>
          </Layout>
        </Container>
      </div>
    </div>
  );
};
