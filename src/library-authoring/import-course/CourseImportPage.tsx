import {
  Button,
  Card,
  Container,
  Layout,
  Stack,
} from '@openedx/paragon';
import { Add } from '@openedx/paragon/icons';
import { Helmet } from 'react-helmet';

import { useIntl, FormattedMessage } from '@edx/frontend-platform/i18n';
import NotFoundAlert from '@src/generic/NotFoundAlert';
import Loading from '@src/generic/Loading';
import SubHeader from '@src/generic/sub-header/SubHeader';
import Header from '@src/header';

import { useLibraryContext } from '../common/context/LibraryContext';
import { useContentLibrary, useCourseMigrations } from '../data/apiHooks';
import { HelpSidebar } from './HelpSidebar';
import { MigratedCourseCard } from './MigratedCourseCard';
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

export const CourseImportPage = () => {
  const intl = useIntl();
  const { libraryId } = useLibraryContext();
  const { data: libraryData } = useContentLibrary(libraryId);

  const { data: courseMigrations } = useCourseMigrations(libraryId);

  if (!libraryData) {
    return <NotFoundAlert />;
  }

  if (!courseMigrations) {
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
          containerProps={{
            size: undefined,
          }}
        />
        <Container className="px-0 mt-4 mb-5 library-authoring-page">
          <div className="px-4 bg-light-200 border-bottom">
            <SubHeader
              title={intl.formatMessage(messages.pageTitle)}
              subtitle={intl.formatMessage(messages.pageSubtitle)}
              hideBorder
            />
          </div>
          <Layout xs={[{ span: 9 }, { span: 3 }]}>
            <Layout.Element>
              {courseMigrations.length ? (
                <Stack gap={3} className="pl-4 mt-4">
                  <h3>Previous Imports</h3>
                  {courseMigrations.map((courseMigration) => (
                    <MigratedCourseCard
                      key={courseMigration.source.key}
                      courseMigration={courseMigration}
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
