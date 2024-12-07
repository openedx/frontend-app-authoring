import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import classNames from 'classnames';
import { StudioFooter } from '@edx/frontend-component-footer';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
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
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from 'react-router-dom';

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
} from '../search-manager';
import LibraryContent, { ContentType } from './LibraryContent';
import { LibrarySidebar } from './library-sidebar';
import { SidebarBodyComponentId, useLibraryContext } from './common/context';
import messages from './messages';

const HeaderActions = () => {
  const intl = useIntl();
  const {
    componentPickerMode,
    openAddContentSidebar,
    openInfoSidebar,
    closeLibrarySidebar,
    sidebarComponentInfo,
    readOnly,
  } = useLibraryContext();

  const infoSidebarIsOpen = () => (
    sidebarComponentInfo?.type === SidebarBodyComponentId.Info
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

const SubHeaderTitle = ({ title }: { title: string }) => {
  const intl = useIntl();

  const { readOnly, componentPickerMode } = useLibraryContext();

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
  const location = useLocation();
  const navigate = useNavigate();

  const {
    isLoadingPage: isLoadingStudioHome,
    isFailedLoadingPage: isFailedLoadingStudioHome,
    librariesV2Enabled,
  } = useStudioHome();

  const {
    libraryId,
    libraryData,
    isLoadingLibraryData,
    componentPickerMode,
    restrictToLibrary,
    showOnlyPublished,
    sidebarComponentInfo,
    openInfoSidebar,
  } = useLibraryContext();

  const [activeKey, setActiveKey] = useState<ContentType | undefined>(ContentType.home);

  useEffect(() => {
    const currentPath = location.pathname.split('/').pop();

    if (componentPickerMode || currentPath === libraryId || currentPath === '') {
      setActiveKey(ContentType.home);
    } else if (currentPath && currentPath in ContentType) {
      setActiveKey(ContentType[currentPath]);
    }
  }, []);

  useEffect(() => {
    if (!componentPickerMode) {
      openInfoSidebar();
    }
  }, []);

  const [searchParams] = useSearchParams();

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

  // istanbul ignore if: this should never happen
  if (activeKey === undefined) {
    return <NotFoundAlert />;
  }

  if (!libraryData) {
    return <NotFoundAlert />;
  }

  const handleTabChange = (key: ContentType) => {
    setActiveKey(key);
    if (!componentPickerMode) {
      navigate({
        pathname: key,
        search: searchParams.toString(),
      });
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
          >
            <SubHeader
              title={<SubHeaderTitle title={libraryData.title} />}
              subtitle={!componentPickerMode ? intl.formatMessage(messages.headingSubtitle) : undefined}
              breadcrumbs={breadcumbs}
              headerActions={<HeaderActions />}
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
              <Tab eventKey={ContentType.home} title={intl.formatMessage(messages.homeTab)} />
              <Tab eventKey={ContentType.components} title={intl.formatMessage(messages.componentsTab)} />
              <Tab eventKey={ContentType.collections} title={intl.formatMessage(messages.collectionsTab)} />
            </Tabs>
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
