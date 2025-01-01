import { useCallback, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import classNames from 'classnames';
import { StudioFooter } from '@edx/frontend-component-footer';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  ActionRow,
  Alert,
  Badge,
  Breadcrumb,
  Button,
  Container,
  Icon,
  Stack,
  Tab,
  Tabs,
} from '@openedx/paragon';
import { Add, ArrowBack, InfoOutline } from '@openedx/paragon/icons';
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
import { ContentType, useLibraryRoutes } from './routes';

import messages from './messages';

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
      navigateTo({ componentId: '', collectionId: '' });
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

export const SubHeaderTitle = ({ title }: { title: string }) => {
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
}

const LibraryAuthoringPage = ({ returnToLibrarySelection }: LibraryAuthoringPageProps) => {
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
    componentId,
    collectionId,
  } = useLibraryContext();
  const { openInfoSidebar, sidebarComponentInfo } = useSidebarContext();

  const { insideCollections, insideComponents, navigateTo } = useLibraryRoutes();

  // The activeKey determines the currently selected tab.
  const getActiveKey = () => {
    if (componentPickerMode) {
      return ContentType.home;
    }
    if (insideCollections) {
      return ContentType.collections;
    }
    if (insideComponents) {
      return ContentType.components;
    }
    return ContentType.home;
  };
  const [activeKey, setActiveKey] = useState<ContentType>(getActiveKey);

  useEffect(() => {
    if (!componentPickerMode) {
      openInfoSidebar(componentId, collectionId);
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
          label: '',
          to: '',
        },
        {
          label: intl.formatMessage(messages.returnToLibrarySelection),
          onClick: returnToLibrarySelection,
        },
      ]}
      spacer={<Icon src={ArrowBack} size="sm" />}
      linkAs={Link}
    />
  ) : undefined;

  const extraFilter = [`context_key = "${libraryId}"`];
  if (showOnlyPublished) {
    extraFilter.push('last_published IS NOT NULL');
  }

  const activeTypeFilters = {
    components: 'NOT type = "collection"',
    collections: 'type = "collection"',
  };
  if (activeKey !== ContentType.home) {
    extraFilter.push(activeTypeFilters[activeKey]);
  }

  // Disable filtering by block/problem type when viewing the Collections tab.
  const overrideTypesFilter = insideCollections ? new TypesFilterData() : undefined;

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
              <Tab eventKey={ContentType.home} title={intl.formatMessage(messages.homeTab)} />
              <Tab eventKey={ContentType.components} title={intl.formatMessage(messages.componentsTab)} />
              <Tab eventKey={ContentType.collections} title={intl.formatMessage(messages.collectionsTab)} />
            </Tabs>
            <ActionRow className="my-3">
              <SearchKeywordsField className="mr-3" />
              <FilterByTags />
              {!insideCollections && <FilterByBlockType />}
              <ClearFiltersButton />
              <ActionRow.Spacer />
              <SearchSortWidget />
            </ActionRow>
            <LibraryContent contentType={activeKey} />
          </SearchContextProvider>
        </Container>
        {!componentPickerMode && <StudioFooter containerProps={{ size: undefined }} />}
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
