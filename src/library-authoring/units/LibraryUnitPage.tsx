import { useIntl } from '@edx/frontend-platform/i18n';
import { Container } from '@openedx/paragon';
import { Helmet } from 'react-helmet';

import ErrorAlert from '@src/generic/alert-error';
import { ContainerType } from '@src/generic/key-utils';
import type { ContainerHit } from '@src/search-manager';
import Loading from '../../generic/Loading';
import NotFoundAlert from '../../generic/NotFoundAlert';
import SubHeader from '../../generic/sub-header/SubHeader';
import Header from '../../header';

import { useLibraryContext } from '../common/context/LibraryContext';
import { useSidebarContext } from '../common/context/SidebarContext';
import { useContentFromSearchIndex, useContentLibrary } from '../data/apiHooks';
import { LibrarySidebar } from '../library-sidebar';
import { ParentBreadcrumbs } from '../generic/parent-breadcrumbs';
import { SubHeaderTitle } from '../LibraryAuthoringPage';
import { LibraryUnitBlocks } from './LibraryUnitBlocks';
import messages from './messages';
import { ContainerEditableTitle, FooterActions, HeaderActions } from '../containers';

export const LibraryUnitPage = () => {
  const intl = useIntl();

  const { libraryId, containerId, readOnly } = useLibraryContext();

  // istanbul ignore if: this should never happen
  if (!containerId) {
    throw new Error('containerId is required');
  }

  const { sidebarItemInfo } = useSidebarContext();

  const { data: libraryData, isPending: isLibPending } = useContentLibrary(libraryId);
  // fetch unitData from index as it includes its parent subsections as well.
  const {
    hits, isPending, isError, error,
  } = useContentFromSearchIndex(containerId ? [containerId] : []);
  const unitData = (hits as ContainerHit[])?.[0];

  if (!containerId || !libraryId) {
    // istanbul ignore next - This shouldn't be possible; it's just here to satisfy the type checker.
    throw new Error('Rendered without containerId or libraryId URL parameter');
  }

  // Only show loading if unit or library data is not fetched from index yet
  if (isLibPending || isPending) {
    return <Loading />;
  }

  if (!libraryData || !unitData) {
    return <NotFoundAlert />;
  }

  // istanbul ignore if
  if (isError) {
    return <ErrorAlert error={error} />;
  }

  return (
    <div className="d-flex">
      <div className="flex-grow-1">
        <Helmet><title>{libraryData.title} | {process.env.SITE_NAME}</title></Helmet>
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
        <Container className="px-0 mt-4 mb-5 library-authoring-page bg-white">
          <div className="px-4 bg-light-200 border-bottom mb-2">
            <SubHeader
              title={<SubHeaderTitle title={<ContainerEditableTitle containerId={containerId} />} />}
              headerActions={(
                <HeaderActions
                  containerKey={containerId}
                  infoBtnText={intl.formatMessage(messages.infoButtonText)}
                  addContentBtnText={intl.formatMessage(messages.addContentButton)}
                />
              )}
              breadcrumbs={(
                <ParentBreadcrumbs
                  libraryData={libraryData}
                  parents={unitData.subsections}
                  containerType={ContainerType.Unit}
                />
              )}
              hideBorder
            />
          </div>
          <Container className="px-4 py-4">
            <LibraryUnitBlocks unitId={containerId} />
            <FooterActions
              addContentBtnText={intl.formatMessage(messages.newContentButton)}
              addExistingContentBtnText={intl.formatMessage(messages.addExistingContentButton)}
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
