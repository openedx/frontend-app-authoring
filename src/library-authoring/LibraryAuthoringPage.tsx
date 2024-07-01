import React, { useContext } from 'react';
import { StudioFooter } from '@edx/frontend-component-footer';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Button,
  Container,
  Icon,
  IconButton,
  SearchField,
  Tab,
  Tabs,
  Row,
  Col,
} from '@openedx/paragon';
import { Add, InfoOutline } from '@openedx/paragon/icons';
import {
  Routes, Route, useLocation, useNavigate, useParams,
} from 'react-router-dom';

import Loading from '../generic/Loading';
import SubHeader from '../generic/sub-header/SubHeader';
import Header from '../header';
import NotFoundAlert from '../generic/NotFoundAlert';
import LibraryComponents from './components/LibraryComponents';
import LibraryCollections from './LibraryCollections';
import LibraryHome from './LibraryHome';
import { useContentLibrary } from './data/apiHooks';
import messages from './messages';
import { LibrarySidebar } from './library-sidebar';
import { LibraryContext } from './common/context';

enum TabList {
  home = '',
  components = 'components',
  collections = 'collections',
}

const SubHeaderTitle = ({ title }: { title: string }) => {
  const intl = useIntl();
  const { openInfoSidebar } = useContext(LibraryContext);

  return (
    <>
      {title}
      <IconButton
        src={InfoOutline}
        iconAs={Icon}
        alt={intl.formatMessage(messages.headingInfoAlt)}
        className="mr-2"
        onClick={openInfoSidebar}
      />
    </>
  );
};

const LibraryAuthoringPage = () => {
  const intl = useIntl();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchKeywords, setSearchKeywords] = React.useState('');

  const { libraryId } = useParams();

  const { data: libraryData, isLoading } = useContentLibrary(libraryId);

  const currentPath = location.pathname.split('/').pop();
  const activeKey = (currentPath && currentPath in TabList) ? TabList[currentPath] : TabList.home;
  const {
    sidebarBodyComponent,
    openAddContentSidebar,
    openInfoSidebar,
  } = useContext(LibraryContext);

  useEffect(() => {
    // Open Library Info sidebar by default
    if (!isLoading && libraryData) {
      openInfoSidebar();
    };
  }, [isLoading, libraryData]);

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
          <Container size="xl" className="p-4 mt-3">
            <SubHeader
              title={<SubHeaderTitle title={libraryData.title} />}
              subtitle={intl.formatMessage(messages.headingSubtitle)}
              headerActions={[
                <Button
                  iconBefore={Add}
                  variant="primary rounded-0"
                  onClick={() => openAddContentSidebar()}
                  disabled={!libraryData.canEditLibrary}
                >
                  {intl.formatMessage(messages.newContentButton)}
                </Button>,
              ]}
            />
            <SearchField
              value={searchKeywords}
              placeholder={intl.formatMessage(messages.searchPlaceholder)}
              onChange={(value: string) => setSearchKeywords(value)}
              onSubmit={() => {}}
              className="w-50"
            />
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
                element={<LibraryHome libraryId={libraryId} filter={{ searchKeywords }} />}
              />
              <Route
                path={TabList.components}
                element={<LibraryComponents libraryId={libraryId} filter={{ searchKeywords }} variant="full" />}
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
          <StudioFooter />
        </Col>
        { sidebarBodyComponent !== null && (
          <Col xs={6} md={4} className="box-shadow-left-1">
            <LibrarySidebar library={libraryData}/>
          </Col>
        )}
      </Row>
    </Container>
  );
};

export default LibraryAuthoringPage;
