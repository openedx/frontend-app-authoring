import {
  type ReactNode,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { Helmet } from 'react-helmet';
import classNames from 'classnames';
import { StudioFooterSlot } from '@edx/frontend-component-footer';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  ActionRow,
  Alert,
  Badge,
  Breadcrumb,
  Button,
  Container,
  Stack,
  Tab,
  Tabs,
} from '@openedx/paragon';
import { Add, InfoOutline } from '@openedx/paragon/icons';
import { Link } from 'react-router-dom';

import Loading from '../generic/Loading';
import SubHeader from '../generic/sub-header/SubHeader';
import Header from '../header';
import NotFoundAlert from '../generic/NotFoundAlert';
import { useStudioHome } from '../studio-home/hooks';
import {
  ClearFiltersButton,
  FilterByBlockType,
  FilterByTags,
  SearchContextProvider,
  SearchKeywordsField,
  SearchSortWidget,
  TypesFilterData,
} from '../search-manager';
import LibraryContent from './LibraryContent';
import { LibrarySidebar } from './library-sidebar';
import { useComponentPickerContext } from './common/context/ComponentPickerContext';
import { useLibraryContext } from './common/context/LibraryContext';
import { SidebarBodyComponentId, useSidebarContext } from './common/context/SidebarContext';
import { allLibraryPageTabs, ContentType, useLibraryRoutes } from './routes';

import messages from './messages';
import LibraryFilterByPublished from './generic/filter-by-published';

const HeaderActions = () => {
  const intl = useIntl();

  const { readOnly } = useLibraryContext();

  const {
    openAddContentSidebar,
    openLibrarySidebar,
    closeLibrarySidebar,
    sidebarComponentInfo,
  } = useSidebarContext();

  const { componentPickerMode } = useComponentPickerContext();

  const infoSidebarIsOpen = sidebarComponentInfo?.type === SidebarBodyComponentId.Info;

  const { navigateTo } = useLibraryRoutes();
  const handleOnClickInfoSidebar = useCallback(() => {
    if (infoSidebarIsOpen) {
      closeLibrarySidebar();
    } else {
      openLibrarySidebar();
    }

    if (!componentPickerMode) {
      // Reset URL to library home
      navigateTo({ componentId: '', collectionId: '', unitId: '' });
    }
  }, [navigateTo, sidebarComponentInfo, closeLibrarySidebar, openLibrarySidebar]);

  return (
    <div className="header-actions">
      <Button
        className={classNames('mr-1', {
          'normal-border': !infoSidebarIsOpen,
          'open-border': infoSidebarIsOpen,
        })}
        iconBefore={InfoOutline}
        variant="outline-primary rounded-0"
        onClick={handleOnClickInfoSidebar}
      >
        {intl.formatMessage(messages.libraryInfoButton)}
      </Button>
      {!componentPickerMode && (
        <Button
          className="ml-1"
          iconBefore={Add}
          variant="primary rounded-0"
          onClick={openAddContentSidebar}
          disabled={readOnly}
        >
          {intl.formatMessage(messages.newContentButton)}
        </Button>
      )}
    </div>
  );
};

export const SubHeaderTitle = ({ title }: { title: ReactNode }) => {
  const intl = useIntl();

  const { readOnly } = useLibraryContext();
  const { componentPickerMode } = useComponentPickerContext();

  const showReadOnlyBadge = readOnly && !componentPickerMode;

  return (
    <Stack direction="vertical">
      {title}
      {showReadOnlyBadge && (
        <div>
          <Badge variant="primary" style={{ fontSize: '50%' }}>
            {intl.formatMessage(messages.readOnlyBadge)}
          </Badge>
        </div>
      )}
    </Stack>
  );
};

interface LibraryAuthoringPageProps {
  returnToLibrarySelection?: () => void,
  visibleTabs?: ContentType[],
}

const LibraryAuthoringPage = ({
  returnToLibrarySelection,
  visibleTabs = allLibraryPageTabs,
}: LibraryAuthoringPageProps) => {
  const intl = useIntl();

  const {
    isLoadingPage: isLoadingStudioHome,
    isFailedLoadingPage: isFailedLoadingStudioHome,
    librariesV2Enabled,
  } = useStudioHome();

  const { componentPickerMode, restrictToLibrary } = useComponentPickerContext();
  const {
    libraryId,
    libraryData,
    isLoadingLibraryData,
    showOnlyPublished,
    extraFilter: contextExtraFilter,
    componentId,
    collectionId,
    unitId,
  } = useLibraryContext();
  const { openInfoSidebar, sidebarComponentInfo } = useSidebarContext();

  const {
    insideCollections,
    insideComponents,
    insideUnits,
    navigateTo,
  } = useLibraryRoutes();

  // The activeKey determines the currently selected tab.
  const getActiveKey = () => {
    if (componentPickerMode) {
      return visibleTabs[0];
    }
    if (insideCollections) {
      return ContentType.collections;
    }
    if (insideComponents) {
      return ContentType.components;
    }
    if (insideUnits) {
      return ContentType.units;
    }
    return ContentType.home;
  };
  const [activeKey, setActiveKey] = useState<ContentType>(getActiveKey);

  useEffect(() => {
    if (!componentPickerMode) {
      openInfoSidebar(componentId, collectionId, unitId);
    }
  }, []);

  if (isLoadingLibraryData) {
    return <Loading />;
  }

  if (!isLoadingStudioHome && (!librariesV2Enabled || isFailedLoadingStudioHome)) {
    return (
      <Alert variant="danger">
        {intl.formatMessage(messages.librariesV2DisabledError)}
      </Alert>
    );
  }

  if (!libraryData) {
    return <NotFoundAlert />;
  }

  const handleTabChange = (key: ContentType) => {
    setActiveKey(key);
    if (!componentPickerMode) {
      navigateTo({ contentType: key });
    }
  };

  const breadcumbs = componentPickerMode && !restrictToLibrary ? (
    <Breadcrumb
      links={[
        {
          label: intl.formatMessage(messages.returnToLibrarySelection),
          onClick: returnToLibrarySelection,
        },
      ]}
      linkAs={Link}
    />
  ) : undefined;

  const extraFilter = [`context_key = "${libraryId}"`];
  if (showOnlyPublished) {
    extraFilter.push('last_published IS NOT NULL');
  }

  if (contextExtraFilter) {
    extraFilter.push(...contextExtraFilter);
  }

  const activeTypeFilters = {
    components: 'type = "library_block"',
    collections: 'type = "collection"',
    units: 'block_type = "unit"',
  };
  if (activeKey !== ContentType.home) {
    extraFilter.push(activeTypeFilters[activeKey]);
  }

  /*

  <FilterByPublished key={
                // It is necessary to re-render `FilterByPublished` every time `FilterByBlockType`
                // appears or disappears, this is because when the menu is opened it is rendered
                // in a previous state, causing an inconsistency in its position.
                // By changing the key we can re-render the component.
                !(insideCollections || insideUnits) ? 'filter-published-1' : 'filter-published-2'
              }
  */

  // Disable filtering by block/problem type when viewing the Collections tab.
  const overrideTypesFilter = (insideCollections || insideUnits) ? new TypesFilterData() : undefined;

  const tabTitles = {
    [ContentType.home]: intl.formatMessage(messages.homeTab),
    [ContentType.collections]: intl.formatMessage(messages.collectionsTab),
    [ContentType.components]: intl.formatMessage(messages.componentsTab),
    [ContentType.units]: intl.formatMessage(messages.unitsTab),
  };
  const visibleTabsToRender = visibleTabs.map((contentType) => (
    <Tab key={contentType} eventKey={contentType} title={tabTitles[contentType]} />
  ));

  return (
    <div className="d-flex">
      <div className="flex-grow-1">
        <Helmet><title>{libraryData.title} | {process.env.SITE_NAME}</title></Helmet>
        {!componentPickerMode && (
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
        )}
        <Container className="px-4 mt-4 mb-5 library-authoring-page">
          <SearchContextProvider
            extraFilter={extraFilter}
            overrideTypesFilter={overrideTypesFilter}
          >
            <SubHeader
              title={<SubHeaderTitle title={libraryData.title} />}
              subtitle={!componentPickerMode ? intl.formatMessage(messages.headingSubtitle) : undefined}
              breadcrumbs={breadcumbs}
              headerActions={<HeaderActions />}
              hideBorder
            />
            <Tabs
              variant="tabs"
              activeKey={activeKey}
              onSelect={handleTabChange}
              className="my-3"
            >
              {visibleTabsToRender}
            </Tabs>
            <ActionRow className="my-3">
              <SearchKeywordsField className="mr-3" />
              <FilterByTags />
              {!(insideCollections || insideUnits) && <FilterByBlockType />}
              <LibraryFilterByPublished key={
                // It is necessary to re-render `LibraryFilterByPublished` every time `FilterByBlockType`
                // appears or disappears, this is because when the menu is opened it is rendered
                // in a previous state, causing an inconsistency in its position.
                // By changing the key we can re-render the component.
                !(insideCollections || insideUnits) ? 'filter-published-1' : 'filter-published-2'
              }
              />
              <ClearFiltersButton />
              <ActionRow.Spacer />
              <SearchSortWidget />
            </ActionRow>
            <LibraryContent contentType={activeKey} />
          </SearchContextProvider>
        </Container>
        {!componentPickerMode && <StudioFooterSlot containerProps={{ size: undefined }} />}
      </div>
      {!!sidebarComponentInfo?.type && (
        <div className="library-authoring-sidebar box-shadow-left-1 bg-white" data-testid="library-sidebar">
          <LibrarySidebar />
        </div>
      )}
    </div>
  );
};

export default LibraryAuthoringPage;
