import {
  type ReactNode,
  useCallback,
  useContext,
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
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';

import { useMigrationStatus } from '@src/legacy-libraries-migration/data/apiHooks';
import Loading from '@src/generic/Loading';
import SubHeader from '@src/generic/sub-header/SubHeader';
import Header from '@src/header';
import NotFoundAlert from '@src/generic/NotFoundAlert';
import { useStudioHome } from '@src/studio-home/hooks';
import {
  ClearFiltersButton,
  FilterByBlockType,
  FilterByTags,
  SearchContextProvider,
  SearchKeywordsField,
  SearchSortWidget,
  TypesFilterData,
} from '@src/search-manager';
import { ToastContext } from '@src/generic/toast-context';
import migrationMessages from '@src/legacy-libraries-migration/messages';

import LibraryContent from './LibraryContent';
import { LibrarySidebar } from './library-sidebar';
import { useComponentPickerContext } from './common/context/ComponentPickerContext';
import { useLibraryContext } from './common/context/LibraryContext';
import { SidebarBodyItemId, useSidebarContext } from './common/context/SidebarContext';
import { allLibraryPageTabs, ContentType, useLibraryRoutes } from './routes';
import messages from './messages';
import LibraryFilterByPublished from './generic/filter-by-published';
import { libraryQueryPredicate } from './data/apiHooks';

const HeaderActions = () => {
  const intl = useIntl();

  const { readOnly } = useLibraryContext();

  const {
    openAddContentSidebar,
    openLibrarySidebar,
    closeLibrarySidebar,
    sidebarItemInfo,
  } = useSidebarContext();

  const { componentPickerMode } = useComponentPickerContext();

  const infoSidebarIsOpen = sidebarItemInfo?.type === SidebarBodyItemId.Info;

  const { navigateTo } = useLibraryRoutes();
  const handleOnClickInfoSidebar = useCallback(() => {
    if (infoSidebarIsOpen) {
      closeLibrarySidebar();
    } else {
      openLibrarySidebar();
    }

    if (!componentPickerMode) {
      // If not in component picker mode, reset selected item when opening the info sidebar
      navigateTo({ selectedItemId: '' });
    }
  }, [navigateTo, sidebarItemInfo, closeLibrarySidebar, openLibrarySidebar]);

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
    <Stack direction="vertical" className="mt-1.5">
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
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const { showToast } = useContext(ToastContext);
  const queryClient = useQueryClient();

  // Get migration status every second if applicable
  const migrationId = params.get('migration_task');
  const {
    data: migrationStatusData,
  } = useMigrationStatus(migrationId);

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
  } = useLibraryContext();
  const { sidebarItemInfo } = useSidebarContext();

  const {
    insideCollections,
    insideComponents,
    insideUnits,
    insideSection,
    insideSections,
    insideSubsection,
    insideSubsections,
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
    if (insideSubsections) {
      return ContentType.subsections;
    }
    if (insideSections) {
      return ContentType.sections;
    }
    return ContentType.home;
  };

  const [activeKey, setActiveKey] = useState<ContentType>(getActiveKey);

  useEffect(() => {
    if (!componentPickerMode) {
      // Update the active key whenever the route changes. This ensures that the correct tab is selected
      // when navigating using the browser's back/forward buttons because it does not trigger a re-render.
      setActiveKey(getActiveKey());
    }
  }, [location.key, getActiveKey]);

  const handleTabChange = useCallback((key: ContentType) => {
    setActiveKey(key);
    if (!componentPickerMode) {
      navigateTo({ contentType: key });
    }
  }, [navigateTo]);

  // Verify the migration task status
  if (migrationId) {
    let deleteMigrationIdParam = false;
    if (migrationStatusData?.state === 'Succeeded') {
      // Check if any library migrations failed.
      // A `Succeeded` state means that the bulk migration ended, but some libraries might have failed.
      const failedMigrations = migrationStatusData.parameters.filter(item => item.isFailed);
      if (failedMigrations.length > 1) {
        showToast(intl.formatMessage(migrationMessages.migrationFailedMultiple));
      } else if (failedMigrations.length === 1) {
        showToast(intl.formatMessage(
          migrationMessages.migrationFailedOneLibrary,
          {
            key: failedMigrations[0].source,
          },
        ));
      } else {
        showToast(intl.formatMessage(migrationMessages.migrationSuccess));
      }
      queryClient.invalidateQueries({ predicate: (query) => libraryQueryPredicate(query, libraryId) });
      deleteMigrationIdParam = true;
    } else if (migrationStatusData?.state === 'Failed') {
      // A `Failed` state means that the entire bulk migration has failed.
      showToast(intl.formatMessage(migrationMessages.migrationFailed));
      deleteMigrationIdParam = true;
    } else if (migrationStatusData?.state === 'Canceled') {
      /* istanbul ignore next */
      deleteMigrationIdParam = true;
    }

    if (deleteMigrationIdParam) {
      params.delete('migration_task');
      navigate({
        pathname: location.pathname,
        search: params.toString(),
      }, { replace: true });
    }
  }

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
    subsections: 'block_type = "subsection"',
    sections: 'block_type = "section"',
  };
  if (activeKey !== ContentType.home) {
    extraFilter.push(activeTypeFilters[activeKey]);
  }

  // Disable filtering by block/problem type when viewing the Collections/Units/Sections/Subsections tab,
  // or when inside a specific Section or Subsection.
  const onlyOneType = (
    insideCollections || insideUnits || insideSections || insideSubsections
      || insideSection || insideSubsection
      || !([ContentType.home, ContentType.components].includes(activeKey))
  );
  const overrideTypesFilter = onlyOneType
    ? new TypesFilterData()
    : undefined;

  const tabTitles = {
    [ContentType.home]: intl.formatMessage(messages.homeTab),
    [ContentType.collections]: intl.formatMessage(messages.collectionsTab),
    [ContentType.components]: intl.formatMessage(messages.componentsTab),
    [ContentType.units]: intl.formatMessage(messages.unitsTab),
    [ContentType.subsections]: intl.formatMessage(messages.subsectionsTab),
    [ContentType.sections]: intl.formatMessage(messages.sectionsTab),
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
            {visibleTabs.length > 1 && (
              <Tabs
                variant="tabs"
                activeKey={activeKey}
                onSelect={handleTabChange}
                className="my-3"
              >
                {visibleTabsToRender}
              </Tabs>
            )}
            <ActionRow className="my-3">
              <SearchKeywordsField className="mr-3" />
              <FilterByTags />
              {!(onlyOneType) && <FilterByBlockType />}
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
      {!!sidebarItemInfo?.type && (
        <div className="library-authoring-sidebar box-shadow-left-1 bg-white" data-testid="library-sidebar">
          <LibrarySidebar />
        </div>
      )}
    </div>
  );
};

export default LibraryAuthoringPage;
