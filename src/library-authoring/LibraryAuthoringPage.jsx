// @ts-check
/* eslint-disable react/prop-types */
import React, { useEffect } from 'react';
import { StudioFooter } from '@edx/frontend-component-footer';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Container, Icon, IconButton, SearchField, Tab, Tabs,
} from '@openedx/paragon';
import { InfoOutline } from '@openedx/paragon/icons';
import {
  Routes, Route, useLocation, useNavigate, useParams,
} from 'react-router-dom';

import Loading from '../generic/Loading';
import SubHeader from '../generic/sub-header/SubHeader';
import Header from '../header';
import NotFoundAlert from '../generic/NotFoundAlert';
import LibraryComponents from './LibraryComponents';
import LibraryCollections from './LibraryCollections';
import LibraryHome from './LibraryHome';
import { useContentLibrary } from './data/apiHook';
import messages from './messages';

const TAB_LIST = {
  home: '',
  components: 'components',
  collections: 'collections',
};

const SubHeaderTitle = ({ title }) => (
  <>
    {title}
    <IconButton src={InfoOutline} iconAs={Icon} alt="Info" onClick={() => {}} className="mr-2" />
  </>
);

/**
 * @type {React.FC}
 */
const LibraryAuthoringPage = () => {
  const intl = useIntl();
  const location = useLocation();
  const navigate = useNavigate();
  const [tabKey, setTabKey] = React.useState(TAB_LIST.home);
  const [searchKeywords, setSearchKeywords] = React.useState('');

  const { libraryId } = useParams();

  const { data: libraryData, isLoading } = useContentLibrary(libraryId);

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

  /** Handle tab change
    * @param {string} key
    */
  const handleTabChange = (key) => {
    setTabKey(key);
    navigate(key);
  };

  return (
    <>
      <Header
        number={libraryData.version.toString()}
        title={libraryData.title}
        org={libraryData.org}
        contentId={libraryId}
        isLibrary
      />
      <Container size="xl" className="p-4 mt-3">
        <SubHeader
          title={<SubHeaderTitle title={libraryData.title} />}
          subtitle={intl.formatMessage(messages.headingSubtitle)}
        />
        <SearchField
          value={searchKeywords}
          placeholder={intl.formatMessage(messages.searchPlaceholder)}
          onSubmit={(value) => setSearchKeywords(value)}
          onChange={(value) => setSearchKeywords(value)}
          className="w-50"
        />
        <Tabs
          variant="tabs"
          activeKey={tabKey}
          onSelect={handleTabChange}
          className="my-3"
        >
          <Tab eventKey={TAB_LIST.home} title="Home" />
          <Tab eventKey={TAB_LIST.components} title="Components" />
          <Tab eventKey={TAB_LIST.collections} title="Collections" />
        </Tabs>
        <Routes>
          <Route
            path={TAB_LIST.home}
            element={<LibraryHome libraryId={libraryId} filter={{ searchKeywords }} />}
          />
          <Route
            path={TAB_LIST.components}
            element={<LibraryComponents libraryId={libraryId} filter={{ searchKeywords }} />}
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
      <StudioFooter />
    </>
  );
};

export default LibraryAuthoringPage;
