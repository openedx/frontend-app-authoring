import { useIntl } from '@edx/frontend-platform/i18n';
import { Breadcrumb, Button, Container } from '@openedx/paragon';
import { Add, InfoOutline } from '@openedx/paragon/icons';
import { useCallback, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';

import ErrorAlert from '../../generic/alert-error';
import Loading from '../../generic/Loading';
import NotFoundAlert from '../../generic/NotFoundAlert';
import SubHeader from '../../generic/sub-header/SubHeader';
import Header from '../../header';
import { useLibraryContext } from '../common/context/LibraryContext';
import {
  COLLECTION_INFO_TABS, COMPONENT_INFO_TABS, SidebarBodyComponentId, UNIT_INFO_TABS, useSidebarContext,
} from '../common/context/SidebarContext';
import { useContainer, useContentLibrary } from '../data/apiHooks';
import { LibrarySidebar } from '../library-sidebar';
import { SubHeaderTitle } from '../LibraryAuthoringPage';
import { useLibraryRoutes } from '../routes';
import { LibraryUnitBlocks } from './LibraryUnitBlocks';
import messages from './messages';

const HeaderActions = () => {
  const intl = useIntl();

  const { unitId, readOnly } = useLibraryContext();
  const {
    openAddContentSidebar,
    closeLibrarySidebar,
    openUnitInfoSidebar,
    sidebarComponentInfo,
  } = useSidebarContext();
  const { navigateTo } = useLibraryRoutes();

  // istanbul ignore if: this should never happen
  if (!unitId) {
    throw new Error('it should not be possible to render HeaderActions without a unitId');
  }

  const infoSidebarIsOpen = sidebarComponentInfo?.type === SidebarBodyComponentId.UnitInfo
    && sidebarComponentInfo?.id === unitId;

  const handleOnClickInfoSidebar = useCallback(() => {
    if (infoSidebarIsOpen) {
      closeLibrarySidebar();
    } else {
      openUnitInfoSidebar(unitId);
    }
    navigateTo({ unitId });
  }, [unitId, infoSidebarIsOpen]);

  return (
    <div className="header-actions">
      <Button
        className="normal-border"
        iconBefore={InfoOutline}
        variant="outline-primary rounded-0"
        onClick={handleOnClickInfoSidebar}
      >
        {intl.formatMessage(messages.infoButtonText)}
      </Button>
      <Button
        className="ml-2"
        iconBefore={Add}
        variant="primary rounded-0"
        disabled={readOnly}
        onClick={openAddContentSidebar}
      >
        {intl.formatMessage(messages.addContentButton)}
      </Button>
    </div>
  );
};

export const LibraryUnitPage = () => {
  const intl = useIntl();

  const {
    libraryId,
    unitId,
    collectionId,
    componentId,
  } = useLibraryContext();
  const {
    sidebarComponentInfo,
    openInfoSidebar,
    setDefaultTab,
    setHiddenTabs,
  } = useSidebarContext();

  useEffect(() => {
    setDefaultTab({
      collection: COLLECTION_INFO_TABS.Details,
      component: COMPONENT_INFO_TABS.Manage,
      unit: UNIT_INFO_TABS.Organize,
    });
    setHiddenTabs([COMPONENT_INFO_TABS.Preview, UNIT_INFO_TABS.Preview]);
    return () => {
      setDefaultTab({
        component: COMPONENT_INFO_TABS.Preview,
        unit: UNIT_INFO_TABS.Preview,
        collection: COLLECTION_INFO_TABS.Manage,
      });
      setHiddenTabs([]);
    };
  }, [setDefaultTab, setHiddenTabs]);

  useEffect(() => {
    openInfoSidebar(componentId, collectionId, unitId);
  }, [componentId, unitId, collectionId]);

  if (!unitId || !libraryId) {
    // istanbul ignore next - This shouldn't be possible; it's just here to satisfy the type checker.
    throw new Error('Rendered without unitId or libraryId URL parameter');
  }

  const { data: libraryData, isLoading: isLibLoading } = useContentLibrary(libraryId);
  const {
    data: unitData,
    isLoading,
    isError,
    error,
  } = useContainer(libraryId, unitId);

  // Only show loading if unit or library data is not fetched from index yet
  if (isLibLoading || isLoading) {
    return <Loading />;
  }

  if (!libraryData || !unitData) {
    return <NotFoundAlert />;
  }

  if (isError) {
    // istanbul ignore next
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
              title={<SubHeaderTitle title={unitData.displayName} />}
              headerActions={<HeaderActions />}
              breadcrumbs={breadcrumbs}
              hideBorder
            />
          </div>
          <Container className="px-4 py-4">
            <LibraryUnitBlocks />
          </Container>
        </Container>
      </div>
      {!!sidebarComponentInfo?.type && (
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
