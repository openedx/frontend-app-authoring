import React, { useContext, useEffect } from 'react';
import { StudioFooter } from '@edx/frontend-component-footer';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Button,
  Col,
  Container,
  Row,
  Tab,
  Tabs,
} from '@openedx/paragon';
import { Add, InfoOutline } from '@openedx/paragon/icons';
import {
  Routes, Route, useLocation, useNavigate, useParams,
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
} from '../search-manager';
import LibraryComponents from './components/LibraryComponents';
import LibraryCollections from './LibraryCollections';
import LibraryHome from './LibraryHome';
import { useContentLibrary } from './data/apiHooks';
import { LibrarySidebar } from './library-sidebar';
import { LibraryContext } from './common/context';
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
  } = useContext(LibraryContext);

  return (
    <>
      <Button
        iconBefore={InfoOutline}
        variant="outline-primary rounded-0"
        onClick={() => openInfoSidebar()}
      >
        {intl.formatMessage(messages.libraryInfoButton)}
      </Button>
      <Button
        iconBefore={Add}
        variant="primary rounded-0"
        onClick={() => openAddContentSidebar()}
        disabled={!canEditLibrary}
      >
        {intl.formatMessage(messages.newContentButton)}
      </Button>
    </>
  );
};

const LibraryAuthoringPage = () => {
  const intl = useIntl();
  const location = useLocation();
  const navigate = useNavigate();

  const { libraryId } = useParams();

  const { data: libraryData, isLoading } = useContentLibrary(libraryId);

  const currentPath = location.pathname.split('/').pop();
  const activeKey = (currentPath && currentPath in TabList) ? TabList[currentPath] : TabList.home;
  const {
    sidebarBodyComponent,
    openInfoSidebar,
  } = useContext(LibraryContext);

  useEffect(() => {
    openInfoSidebar();
  }, []);

  if (isLoading) {
    return <Loading />;
  }

  if (!libraryId || !libraryData) {
    return <NotFoundAlert />;
  }

  const handleTabChange = (key: string) => {
    navigate(key);
  };

  return (
    <Container>
      <Row>
        <Col>
          <Header
            number={libraryData.slug}
            title={libraryData.title}
            org={libraryData.org}
            contextId={libraryId}
            isLibrary
          />
          <SearchContextProvider
            extraFilter={`context_key = "${libraryId}"`}
          >
            <Container size="xl" className="p-4 mt-3">
              <SubHeader
                title={libraryData.title}
                subtitle={intl.formatMessage(messages.headingSubtitle)}
                headerActions={<HeaderActions canEditLibrary={libraryData.canEditLibrary} />}
              />
              <SearchKeywordsField className="w-50" />
              <div className="d-flex mt-3 align-items-center">
                <FilterByTags />
                <FilterByBlockType />
                <ClearFiltersButton />
                <div className="flex-grow-1" />
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
                  element={<LibraryHome libraryId={libraryId} />}
                />
                <Route
                  path={TabList.components}
                  element={<LibraryComponents libraryId={libraryId} variant="full" />}
                />
                <Route
                  path={TabList.collections}
                  element={<LibraryCollections />}
                />
                <Route
                  path="*"
                  element={<NotFoundAlert />}
                />
              </Routes>
            </Container>
          </SearchContextProvider>
          <StudioFooter />
        </Col>
        { sidebarBodyComponent !== null && (
          <Col xs={3} md={3} className="box-shadow-left-1">
            <LibrarySidebar library={libraryData} />
          </Col>
        )}
      </Row>
    </Container>
  );
};

export default LibraryAuthoringPage;
