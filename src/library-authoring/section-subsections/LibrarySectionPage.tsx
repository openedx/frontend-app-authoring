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
import { Breadcrumb, Button, Container, useToggle } from '@openedx/paragon';
import SubHeader from '../../generic/sub-header/SubHeader';
import { SubHeaderTitle } from '../LibraryAuthoringPage';
import { ContainerEditableTitle } from '../containers';
import { Link } from 'react-router-dom';
import messages from './messages';
import { LibrarySidebar } from '../library-sidebar';
import { ContentType, useLibraryRoutes } from '../routes';
import { LibraryContainerChildren } from './LibraryContainerChildren';
import { Add } from '@openedx/paragon/icons';
import { PickLibraryContentModal } from '../add-content';
import { HeaderActions } from '../containers/HeaderActions';
import { ContainerType } from '../../generic/key-utils';

/** Full library section page */
export const LibrarySectionPage = () => {
  const intl = useIntl();
  const { libraryId, sectionId } = useLibraryContext();
  const [isAddLibraryContentModalOpen, showAddLibraryContentModal, closeAddLibraryContentModal] = useToggle();
  const {
    openInfoSidebar,
    sidebarComponentInfo,
  } = useSidebarContext();

  const { navigateTo } = useLibraryRoutes();
  // Open section or subsection sidebar on mount
  useEffect(() => {
    // includes componentId to open correct sidebar on page mount from url
    openInfoSidebar({ sectionId });
    // avoid including componentId in dependencies to prevent flicker on closing sidebar.
    // See below useEffect that clears componentId on closing sidebar.
  }, [sectionId]);

  if (!sectionId || !libraryId) {
    // istanbul ignore next - This shouldn't be possible; it's just here to satisfy the type checker.
    throw new Error('Rendered without sectionId or libraryId URL parameter');
  }

  const { data: libraryData, isLoading: isLibLoading } = useContentLibrary(libraryId);
  const {
    data: sectionData,
    isLoading,
    isError,
    error,
  } = useContainer(sectionId);

  // Only show loading if section or library data is not fetched from index yet
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
          containerProps={{
            size: undefined,
          }}
        />
        <Container className="px-0 mt-4 mb-5 library-authoring-page bg-white">
          <div className="px-4 bg-light-200 border-bottom mb-2">
            <SubHeader
              title={<SubHeaderTitle title={<ContainerEditableTitle containerId={sectionId} />} />}
              breadcrumbs={breadcrumbs}
              headerActions={(
                <HeaderActions
                  containerKey={sectionId}
                  containerType={ContainerType.Section}
                  infoBtnText={intl.formatMessage(messages.infoButtonText)}
                  addContentBtnText={intl.formatMessage(messages.newContentButton)}
                />
              )}
              hideBorder
            />
          </div>
          <Container className="px-4 py-4">
            <LibraryContainerChildren />
            <div className="d-flex">
              <div className="w-100 mr-2">
                <Button
                  className="ml-2"
                  iconBefore={Add}
                  variant="outline-primary rounded-0"
                  onClick={() => {}}
                  block
                >
                  {intl.formatMessage(messages.addContentButton)}
                </Button>
              </div>
              <div className="w-100 ml-2">
                <Button
                  className="ml-2"
                  iconBefore={Add}
                  variant="outline-primary rounded-0"
                  onClick={showAddLibraryContentModal}
                  block
                >
                  {intl.formatMessage(messages.addExistingContentButton)}
                </Button>
                <PickLibraryContentModal
                  isOpen={isAddLibraryContentModalOpen}
                  onClose={closeAddLibraryContentModal}
                  extraFilter={['block_type = "subsection"']}
                  visibleTabs={[ContentType.home]}
                />
              </div>
            </div>
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
