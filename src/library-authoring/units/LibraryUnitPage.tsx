import { useEffect } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Breadcrumb,
  Container,
} from '@openedx/paragon';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';

import Loading from '../../generic/Loading';
import NotFoundAlert from '../../generic/NotFoundAlert';
import SubHeader from '../../generic/sub-header/SubHeader';
import ErrorAlert from '../../generic/alert-error';
import Header from '../../header';
import { useLibraryContext } from '../common/context/LibraryContext';
import {
  COLLECTION_INFO_TABS,
  COMPONENT_INFO_TABS,
  CONTAINER_INFO_TABS,
  DEFAULT_TAB,
  useSidebarContext,
} from '../common/context/SidebarContext';
import { useContainer, useContentLibrary } from '../data/apiHooks';
import { LibrarySidebar } from '../library-sidebar';
import { SubHeaderTitle } from '../LibraryAuthoringPage';
import { LibraryUnitBlocks } from './LibraryUnitBlocks';
import messages from './messages';
import { ContainerEditableTitle, FooterActions, HeaderActions } from '../containers';

export const LibraryUnitPage = () => {
  const intl = useIntl();

  const {
    libraryId,
    containerId,
  } = useLibraryContext();

  // istanbul ignore if: this should never happen
  if (!containerId) {
    throw new Error('containerId is required');
  }

  const {
    sidebarItemInfo,
    setDefaultTab,
    setHiddenTabs,
  } = useSidebarContext();

  useEffect(() => {
    setDefaultTab({
      collection: COLLECTION_INFO_TABS.Details,
      component: COMPONENT_INFO_TABS.Manage,
      container: CONTAINER_INFO_TABS.Manage,
    });
    setHiddenTabs([
      COMPONENT_INFO_TABS.Preview,
      CONTAINER_INFO_TABS.Preview,
    ]);
    return () => {
      setDefaultTab(DEFAULT_TAB);
      setHiddenTabs([]);
    };
  }, [setDefaultTab, setHiddenTabs]);

  const { data: libraryData, isLoading: isLibLoading } = useContentLibrary(libraryId);
  const {
    data: unitData,
    isLoading,
    isError,
    error,
  } = useContainer(containerId);

  if (!containerId || !libraryId) {
    // istanbul ignore next - This shouldn't be possible; it's just here to satisfy the type checker.
    throw new Error('Rendered without containerId or libraryId URL parameter');
  }

  // Only show loading if unit or library data is not fetched from index yet
  if (isLibLoading || isLoading) {
    return <Loading />;
  }

  if (!libraryData || !unitData) {
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
        <Helmet><title>{libraryData.title} | {process.env.SITE_NAME}</title></Helmet>
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
              breadcrumbs={breadcrumbs}
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
