import { useIntl } from '@edx/frontend-platform/i18n';
import { Helmet } from 'react-helmet';
import { Breadcrumb, Container } from '@openedx/paragon';
import { Link } from 'react-router-dom';
import { useLibraryContext } from '../common/context/LibraryContext';
import { useSidebarContext } from '../common/context/SidebarContext';
import { useContainer, useContentLibrary } from '../data/apiHooks';
import Loading from '../../generic/Loading';
import NotFoundAlert from '../../generic/NotFoundAlert';
import ErrorAlert from '../../generic/alert-error';
import { ContainerType } from '../../generic/key-utils';
import Header from '../../header';
import SubHeader from '../../generic/sub-header/SubHeader';
import { SubHeaderTitle } from '../LibraryAuthoringPage';
import { messages, sectionMessages } from './messages';
import { LibrarySidebar } from '../library-sidebar';
import { LibraryContainerChildren } from './LibraryContainerChildren';
import { ContainerEditableTitle, FooterActions, HeaderActions } from '../containers';

/** Full library section page */
export const LibrarySectionPage = () => {
  const intl = useIntl();
  const { libraryId, containerId, readOnly } = useLibraryContext();
  const {
    sidebarItemInfo,
  } = useSidebarContext();

  if (!containerId || !libraryId) {
    // istanbul ignore next - This shouldn't be possible; it's just here to satisfy the type checker.
    throw new Error('Rendered without containerId or libraryId URL parameter');
  }

  const { data: libraryData, isLoading: isLibLoading } = useContentLibrary(libraryId);
  const {
    data: sectionData,
    isLoading,
    isError,
    error,
  } = useContainer(containerId);

  // show loading if containerId or libraryId is not set or section or library data is not fetched from index yet
  if (isLibLoading || isLoading) {
    return <Loading />;
  }

  if (!libraryData || !sectionData) {
    return <NotFoundAlert />;
  }

  // istanbul ignore if
  if (isError) {
    return <ErrorAlert error={error} />;
  }

  const breadcrumbs = (
    <Breadcrumb
      ariaLabel={intl.formatMessage(messages.breadcrumbsAriaLabel)}
      links={[
        {
          label: libraryData.title,
          to: `/library/${libraryId}`,
        },
        // Adding empty breadcrumb to add the last `>` spacer.
        {
          label: '',
          to: '',
        },
      ]}
      linkAs={Link}
    />
  );

  return (
    <div className="d-flex">
      <div className="flex-grow-1">
        <Helmet>
          <title>
            {libraryData.title} | {sectionData.displayName} | {process.env.SITE_NAME}
          </title>
        </Helmet>
        <Header
          number={libraryData.slug}
          title={libraryData.title}
          org={libraryData.org}
          contextId={libraryData.id}
          isLibrary
          readOnly={readOnly}
          containerProps={{
            size: undefined,
          }}
        />
        <Container className="px-0 mt-4 mb-5 library-authoring-page bg-white">
          <div className="px-4 bg-light-200 border-bottom mb-2">
            <SubHeader
              title={<SubHeaderTitle title={<ContainerEditableTitle containerId={containerId} />} />}
              breadcrumbs={breadcrumbs}
              headerActions={(
                <HeaderActions
                  containerKey={containerId}
                  infoBtnText={intl.formatMessage(sectionMessages.infoButtonText)}
                  addContentBtnText={intl.formatMessage(sectionMessages.newContentButton)}
                />
              )}
              hideBorder
            />
          </div>
          <Container className="px-4 py-4">
            <LibraryContainerChildren containerKey={containerId} />
            <FooterActions
              addContentType={ContainerType.Subsection}
              addContentBtnText={intl.formatMessage(sectionMessages.addContentButton)}
              addExistingContentBtnText={intl.formatMessage(sectionMessages.addExistingContentButton)}
            />
          </Container>
        </Container>
      </div>
      {!!sidebarItemInfo?.type && (
        <div
          className="library-authoring-sidebar box-shadow-left-1 bg-white"
          data-testid="library-sidebar"
        >
          <LibrarySidebar />
        </div>
      )}
    </div>
  );
};
