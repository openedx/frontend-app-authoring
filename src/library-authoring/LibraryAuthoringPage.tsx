import React, { useEffect, useState } from 'react';
import { StudioFooter } from '@edx/frontend-component-footer';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Container, Icon, IconButton, Tab, Tabs,
} from '@openedx/paragon';
import { InfoOutline } from '@openedx/paragon/icons';
import {
  Routes, Route, useLocation, useNavigate, useParams, useSearchParams,
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
import LibraryCollections from './LibraryCollections';
import LibraryHome from './LibraryHome';
import { useContentLibrary } from './data/apiHook';
import messages from './messages';

const TAB_LIST = {
  home: '',
  components: 'components',
  collections: 'collections',
};

const SubHeaderTitle = ({ title }: { title: string }) => {
  const intl = useIntl();
  return (
    <>
      {title}
      <IconButton
        src={InfoOutline}
        iconAs={Icon}
        alt={intl.formatMessage(messages.headingInfoAlt)}
        className="mr-2"
      />
    </>
  );
};

const LibraryAuthoringPage = () => {
  const intl = useIntl();
  const location = useLocation();
  const navigate = useNavigate();
  const [tabKey, setTabKey] = useState(TAB_LIST.home);

  const { libraryId } = useParams();
  const { data: libraryData, isLoading } = useContentLibrary(libraryId);

  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const currentPath = location.pathname.split('/').pop();
    if (currentPath && Object.values(TAB_LIST).includes(currentPath)) {
      setTabKey(currentPath);
    } else {
      setTabKey(TAB_LIST.home);
    }
  }, [location]);

  if (isLoading) {
    return <Loading />;
  }

  if (!libraryId || !libraryData) {
    return <NotFoundAlert />;
  }

  const handleTabChange = (key: string) => {
    setTabKey(key);
    navigate(key);
    setSearchParams(searchParams);
  };

  return (
    <>
      <Header
        number={libraryData.slug}
        title={libraryData.title}
        org={libraryData.org}
        contentId={libraryId}
        isLibrary
      />
      <SearchContextProvider
        extraFilter={`context_key = "${libraryId}"`}
      >
        <Container size="xl" className="p-4 mt-3">
          <SubHeader
            title={<SubHeaderTitle title={libraryData.title} />}
            subtitle={intl.formatMessage(messages.headingSubtitle)}
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
            activeKey={tabKey}
            onSelect={handleTabChange}
            className="my-3"
          >
            <Tab eventKey={TAB_LIST.home} title={intl.formatMessage(messages.homeTab)} />
            <Tab eventKey={TAB_LIST.components} title={intl.formatMessage(messages.componentsTab)} />
            <Tab eventKey={TAB_LIST.collections} title={intl.formatMessage(messages.collectionsTab)} />
          </Tabs>
          <Routes>
            <Route
              path={TAB_LIST.home}
              element={(
                <LibraryHome
                  libraryId={libraryId}
                  tabList={TAB_LIST}
                  handleTabChange={handleTabChange}
                />
              )}
            />
            <Route
              path={TAB_LIST.components}
              element={<LibraryComponents libraryId={libraryId} variant="full" />}
            />
            <Route
              path={TAB_LIST.collections}
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
    </>
  );
};

export default LibraryAuthoringPage;
