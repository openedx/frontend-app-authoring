import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import classNames from 'classnames';
import { StudioFooter } from '@edx/frontend-component-footer';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Badge,
  Button,
  Container,
  Stack,
  Tab,
  Tabs,
} from '@openedx/paragon';
import { Add, InfoOutline } from '@openedx/paragon/icons';
import {
  Routes, Route, useLocation, useNavigate, useSearchParams,
} from 'react-router-dom';

import Loading from '../generic/Loading';
import SubHeader from '../generic/sub-header/SubHeader';
import Header from '../header';
import NotFoundAlert from '../generic/NotFoundAlert';
import {
  ClearFiltersButton,
  FilterByBlockType,
  FilterByTags,
  SearchContextProvider,
  SearchKeywordsField,
  SearchSortWidget,
} from '../search-manager';
import LibraryComponents from './components/LibraryComponents';
import LibraryCollections from './collections/LibraryCollections';
import LibraryHome from './LibraryHome';
import { useContentLibrary } from './data/apiHooks';
import { LibrarySidebar } from './library-sidebar';
import { SidebarBodyComponentId, useLibraryContext } from './common/context';
import messages from './messages';

enum TabList {
  home = '',
  components = 'components',
  collections = 'collections',
}

interface HeaderActionsProps {
  canEditLibrary: boolean;
}

const HeaderActions = ({ canEditLibrary }: HeaderActionsProps) => {
  const intl = useIntl();
  const {
    openAddContentSidebar,
    openInfoSidebar,
    closeLibrarySidebar,
    sidebarBodyComponent,
  } = useLibraryContext();

  if (!canEditLibrary) {
    return null;
  }

  const infoSidebarIsOpen = () => (
    sidebarBodyComponent === SidebarBodyComponentId.Info
  );

  const handleOnClickInfoSidebar = () => {
    if (infoSidebarIsOpen()) {
      closeLibrarySidebar();
    } else {
      openInfoSidebar();
    }
  };

  return (
    <div className="header-actions">
      <Button
        className={classNames('mr-1', {
          'normal-border': !infoSidebarIsOpen(),
          'open-border': infoSidebarIsOpen(),
        })}
        iconBefore={InfoOutline}
        variant="outline-primary rounded-0"
        onClick={handleOnClickInfoSidebar}
      >
        {intl.formatMessage(messages.libraryInfoButton)}
      </Button>
      <Button
        className="ml-1"
        iconBefore={Add}
        variant="primary rounded-0"
        onClick={openAddContentSidebar}
        disabled={!canEditLibrary}
      >
        {intl.formatMessage(messages.newContentButton)}
      </Button>
    </div>
  );
};

const SubHeaderTitle = ({ title, canEditLibrary }: { title: string, canEditLibrary: boolean }) => {
  const intl = useIntl();

  return (
    <Stack direction="vertical">
      {title}
      { !canEditLibrary && (
        <div>
          <Badge variant="primary" style={{ fontSize: '50%' }}>
            {intl.formatMessage(messages.readOnlyBadge)}
          </Badge>
        </div>
      )}
    </Stack>
  );
};

const LibraryAuthoringPage = () => {
  const intl = useIntl();
  const location = useLocation();
  const navigate = useNavigate();

  const { libraryId } = useLibraryContext();
  const { data: libraryData, isLoading } = useContentLibrary(libraryId);

  const currentPath = location.pathname.split('/').pop();
  const activeKey = (currentPath && currentPath in TabList) ? TabList[currentPath] : TabList.home;
  const {
    sidebarBodyComponent,
    openInfoSidebar,
  } = useLibraryContext();

  useEffect(() => {
    openInfoSidebar();
  }, []);

  const [searchParams] = useSearchParams();

  if (isLoading) {
    return <Loading />;
  }

  if (!libraryData) {
    return <NotFoundAlert />;
  }

  const handleTabChange = (key: string) => {
    navigate({
      pathname: key,
      search: searchParams.toString(),
    });
  };

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
        <Container className="px-4 mt-4 mb-5 library-authoring-page">
          <SearchContextProvider
            extraFilter={`context_key = "${libraryId}"`}
          >
            <SubHeader
              title={<SubHeaderTitle title={libraryData.title} canEditLibrary={libraryData.canEditLibrary} />}
              subtitle={intl.formatMessage(messages.headingSubtitle)}
              headerActions={<HeaderActions canEditLibrary={libraryData.canEditLibrary} />}
            />
            <SearchKeywordsField className="w-50" />
            <div className="d-flex mt-3 align-items-center">
              <FilterByTags />
              <FilterByBlockType />
              <ClearFiltersButton />
              <div className="flex-grow-1" />
              <SearchSortWidget />
            </div>
            <Tabs
              variant="tabs"
              activeKey={activeKey}
              onSelect={handleTabChange}
              className="my-3"
            >
              <Tab eventKey={TabList.home} title={intl.formatMessage(messages.homeTab)} />
              <Tab eventKey={TabList.components} title={intl.formatMessage(messages.componentsTab)} />
              <Tab eventKey={TabList.collections} title={intl.formatMessage(messages.collectionsTab)} />
            </Tabs>
            <Routes>
              <Route
                path={TabList.home}
                element={(
                  <LibraryHome tabList={TabList} handleTabChange={handleTabChange} />
                )}
              />
              <Route
                path={TabList.components}
                element={<LibraryComponents variant="full" />}
              />
              <Route
                path={TabList.collections}
                element={<LibraryCollections variant="full" />}
              />
              <Route
                path="*"
                element={<NotFoundAlert />}
              />
            </Routes>
          </SearchContextProvider>
        </Container>
        <StudioFooter containerProps={{ size: undefined }} />
      </div>
      { !!sidebarBodyComponent && (
        <div className="library-authoring-sidebar box-shadow-left-1 bg-white" data-testid="library-sidebar">
          <LibrarySidebar library={libraryData} />
        </div>
      )}
    </div>
  );
};

export default LibraryAuthoringPage;
