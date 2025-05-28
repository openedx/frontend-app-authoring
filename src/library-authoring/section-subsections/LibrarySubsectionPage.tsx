import { useEffect } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Helmet } from 'react-helmet';
import { useLibraryContext } from '../common/context/LibraryContext';
import { useSidebarContext } from '../common/context/SidebarContext';
import { useContainer, useContentLibrary } from '../data/apiHooks';
import Loading from '../../generic/Loading';
import NotFoundAlert from '../../generic/NotFoundAlert';
import ErrorAlert from '../../generic/alert-error';
import Header from '../../header';
import { Breadcrumb, Container } from '@openedx/paragon';
import SubHeader from '../../generic/sub-header/SubHeader';
import { SubHeaderTitle } from '../LibraryAuthoringPage';
import { Link } from 'react-router-dom';
import { messages, subsectionMessages } from './messages';
import { LibrarySidebar } from '../library-sidebar';
import { useLibraryRoutes } from '../routes';
import { LibraryContainerChildren } from './LibraryContainerChildren';
import { ContainerEditableTitle, FooterActions, HeaderActions } from '../containers';
import { ContainerType } from '../../generic/key-utils';

/** Full library subsection page */
export const LibrarySubsectionPage = () => {
  const intl = useIntl();
  const { libraryId, subsectionId } = useLibraryContext();
  const {
    openInfoSidebar,
    sidebarComponentInfo,
  } = useSidebarContext();

  const { navigateTo } = useLibraryRoutes();
  // Open subsection sidebar on mount
  useEffect(() => {
    openInfoSidebar({ subsectionId });
  }, [subsectionId]);

  const { data: libraryData, isLoading: isLibLoading } = useContentLibrary(libraryId);
  const {
    data: sectionData,
    isLoading,
    isError,
    error,
  } = useContainer(subsectionId);

  // Only show loading if section or library data is not fetched from index yet
  if (!subsectionId || !libraryId || isLibLoading || isLoading) {
    return <Loading />;
  }

  // istanbul ignore if
  if (isError) {
    return <ErrorAlert error={error} />;
  }

  if (!libraryData || !sectionData) {
    return <NotFoundAlert />;
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
          containerProps={{
            size: undefined,
          }}
        />
        <Container className="px-0 mt-4 mb-5 library-authoring-page bg-white">
          <div className="px-4 bg-light-200 border-bottom mb-2">
            <SubHeader
              title={<SubHeaderTitle title={<ContainerEditableTitle containerId={subsectionId} />} />}
              breadcrumbs={breadcrumbs}
              headerActions={(
                <HeaderActions
                  containerKey={subsectionId}
                  containerType={ContainerType.Subsection}
                  infoBtnText={intl.formatMessage(subsectionMessages.infoButtonText)}
                  addContentBtnText={intl.formatMessage(subsectionMessages.newContentButton)}
                />
              )}
              hideBorder
            />
          </div>
          <Container className="px-4 py-4">
            <LibraryContainerChildren containerKey={subsectionId} />
            <FooterActions
              addContentBtnText={intl.formatMessage(subsectionMessages.addContentButton)}
              addExistingContentBtnText={intl.formatMessage(subsectionMessages.addExistingContentButton)}
            />
          </Container>
        </Container>
      </div>
      {!!sidebarComponentInfo?.type && (
        <div
          className="library-authoring-sidebar box-shadow-left-1 bg-white"
          data-testid="library-sidebar"
        >
          <LibrarySidebar onSidebarClose={() => navigateTo({ componentId: '' })} />
        </div>
      )}
    </div>
  );
}
