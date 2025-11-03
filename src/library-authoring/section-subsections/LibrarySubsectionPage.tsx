import { useIntl } from '@edx/frontend-platform/i18n';
import { Helmet } from 'react-helmet';
import { Container } from '@openedx/paragon';

import type { ContainerHit } from '@src/search-manager';
import { useLibraryContext } from '../common/context/LibraryContext';
import { useSidebarContext } from '../common/context/SidebarContext';
import { useContentFromSearchIndex, useContentLibrary } from '../data/apiHooks';
import Loading from '../../generic/Loading';
import NotFoundAlert from '../../generic/NotFoundAlert';
import ErrorAlert from '../../generic/alert-error';
import { ContainerType } from '../../generic/key-utils';
import Header from '../../header';
import SubHeader from '../../generic/sub-header/SubHeader';
import { SubHeaderTitle } from '../LibraryAuthoringPage';
import { subsectionMessages } from './messages';
import { LibrarySidebar } from '../library-sidebar';
import { ParentBreadcrumbs } from '../generic/parent-breadcrumbs';
import { LibraryContainerChildren } from './LibraryContainerChildren';
import { ContainerEditableTitle, FooterActions, HeaderActions } from '../containers';

/** Full library subsection page */
export const LibrarySubsectionPage = () => {
  const intl = useIntl();
  const { libraryId, containerId, readOnly } = useLibraryContext();
  const { sidebarItemInfo } = useSidebarContext();

  const { data: libraryData, isPending: isLibPending } = useContentLibrary(libraryId);
  // fetch subsectionData from index as it includes its parent sections as well.
  const {
    hits, isPending, isError, error,
  } = useContentFromSearchIndex(containerId ? [containerId] : []);
  const subsectionData = (hits as ContainerHit[])?.[0];

  if (!containerId || !libraryId) {
    // istanbul ignore next - This shouldn't be possible; it's just here to satisfy the type checker.
    throw new Error('Rendered without containerId or libraryId URL parameter');
  }

  // Only show loading if section or library data is not fetched from index yet
  if (isLibPending || isPending) {
    return <Loading />;
  }

  if (!libraryData || !subsectionData) {
    return <NotFoundAlert />;
  }

  // istanbul ignore if
  if (isError) {
    return <ErrorAlert error={error} />;
  }

  return (
    <div className="d-flex">
      <div className="flex-grow-1">
        <Helmet>
          <title>
            {libraryData.title} | {subsectionData.displayName} | {process.env.SITE_NAME}
          </title>
        </Helmet>
        <Header
          number={libraryData.slug}
          title={libraryData.title}
          org={libraryData.org}
          contextId={libraryData.id}
          readOnly={readOnly}
          isLibrary
          containerProps={{
            size: undefined,
          }}
        />
        <Container className="px-0 mt-4 mb-5 library-authoring-page bg-white">
          <div className="px-4 bg-light-200 border-bottom mb-2">
            <SubHeader
              title={<SubHeaderTitle title={<ContainerEditableTitle containerId={containerId} />} />}
              breadcrumbs={(
                <ParentBreadcrumbs
                  libraryData={libraryData}
                  parents={subsectionData.sections}
                  containerType={subsectionData.blockType}
                />
              )}
              headerActions={(
                <HeaderActions
                  containerKey={containerId}
                  infoBtnText={intl.formatMessage(subsectionMessages.infoButtonText)}
                  addContentBtnText={intl.formatMessage(subsectionMessages.newContentButton)}
                />
              )}
              hideBorder
            />
          </div>
          <Container className="px-4 py-4">
            <LibraryContainerChildren containerKey={containerId} />
            <FooterActions
              addContentType={ContainerType.Unit}
              addContentBtnText={intl.formatMessage(subsectionMessages.addContentButton)}
              addExistingContentBtnText={intl.formatMessage(subsectionMessages.addExistingContentButton)}
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
