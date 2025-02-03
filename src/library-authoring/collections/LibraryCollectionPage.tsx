import { useEffect } from 'react';
import { StudioFooter } from '@edx/frontend-component-footer';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  ActionRow,
  Button,
  Breadcrumb,
  Container,
  Icon,
} from '@openedx/paragon';
import { Add, ArrowBack, InfoOutline } from '@openedx/paragon/icons';
import classNames from 'classnames';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';

import { useLibraryRoutes } from '../routes';
import Loading from '../../generic/Loading';
import ErrorAlert from '../../generic/alert-error';
import SubHeader from '../../generic/sub-header/SubHeader';
import Header from '../../header';
import NotFoundAlert from '../../generic/NotFoundAlert';
import {
  ClearFiltersButton,
  FilterByBlockType,
  FilterByTags,
  SearchContextProvider,
  SearchKeywordsField,
  SearchSortWidget,
} from '../../search-manager';
import { SubHeaderTitle } from '../LibraryAuthoringPage';
import { useCollection, useContentLibrary } from '../data/apiHooks';
import { useComponentPickerContext } from '../common/context/ComponentPickerContext';
import { useLibraryContext } from '../common/context/LibraryContext';
import { SidebarBodyComponentId, useSidebarContext } from '../common/context/SidebarContext';
import messages from './messages';
import { LibrarySidebar } from '../library-sidebar';
import LibraryCollectionComponents from './LibraryCollectionComponents';

const HeaderActions = () => {
  const intl = useIntl();

  const { componentPickerMode } = useComponentPickerContext();
  const { collectionId, readOnly } = useLibraryContext();
  const {
    closeLibrarySidebar,
    openAddContentSidebar,
    openCollectionInfoSidebar,
    sidebarComponentInfo,
  } = useSidebarContext();
  const { navigateTo } = useLibraryRoutes();

  // istanbul ignore if: this should never happen
  if (!collectionId) {
    throw new Error('it should not be possible to render HeaderActions without a collectionId');
  }

  const infoSidebarIsOpen = sidebarComponentInfo?.type === SidebarBodyComponentId.CollectionInfo
    && sidebarComponentInfo?.id === collectionId;

  const handleOnClickInfoSidebar = () => {
    if (infoSidebarIsOpen) {
      closeLibrarySidebar();
    } else {
      openCollectionInfoSidebar(collectionId);
    }

    if (!componentPickerMode) {
      navigateTo({ collectionId });
    }
  };

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
        {intl.formatMessage(messages.collectionInfoButton)}
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

const LibraryCollectionPage = () => {
  const intl = useIntl();

  const { libraryId, collectionId } = useLibraryContext();

  if (!collectionId || !libraryId) {
    // istanbul ignore next - This shouldn't be possible; it's just here to satisfy the type checker.
    throw new Error('Rendered without collectionId or libraryId URL parameter');
  }

  const { componentPickerMode } = useComponentPickerContext();
  const { showOnlyPublished, setCollectionId, componentId } = useLibraryContext();
  const { sidebarComponentInfo, openInfoSidebar } = useSidebarContext();

  const {
    data: collectionData,
    isLoading,
    isError,
    error,
  } = useCollection(libraryId, collectionId);

  useEffect(() => {
    openInfoSidebar(componentId, collectionId);
  }, []);

  const { data: libraryData, isLoading: isLibLoading } = useContentLibrary(libraryId);

  // Only show loading if collection data is not fetched from index yet
  // Loading info for search results will be handled by LibraryCollectionComponents component.
  if (isLibLoading || isLoading) {
    return <Loading />;
  }

  if (!libraryData) {
    return <NotFoundAlert />;
  }

  if (isError) {
    return <ErrorAlert error={error} />;
  }

  const breadcumbs = !componentPickerMode ? (
    <Breadcrumb
      ariaLabel={intl.formatMessage(messages.breadcrumbsAriaLabel)}
      links={[
        {
          label: libraryData.title,
          to: `/library/${libraryId}`,
        },
        {
          label: intl.formatMessage(messages.allCollections),
          to: `/library/${libraryId}/collections`,
        },
        // Adding empty breadcrumb to add the last `>` spacer.
        {
          label: '',
          to: '',
        },
      ]}
      linkAs={Link}
    />
  ) : (
    <Breadcrumb
      ariaLabel={intl.formatMessage(messages.breadcrumbsAriaLabel)}
      links={[
        {
          label: '',
          to: '',
        },
        {
          label: intl.formatMessage(messages.returnToLibrary),
          onClick: () => { setCollectionId(undefined); },
        },
      ]}
      spacer={<Icon src={ArrowBack} size="sm" />}
      linkAs={Link}
    />
  );

  const extraFilter = [`context_key = "${libraryId}"`, `collections.key = "${collectionId}"`];
  if (showOnlyPublished) {
    extraFilter.push('last_published IS NOT NULL');
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
              title={<SubHeaderTitle title={collectionData.title} />}
              breadcrumbs={breadcumbs}
              headerActions={<HeaderActions />}
              hideBorder
            />
            <ActionRow className="my-3">
              <SearchKeywordsField className="mr-3" />
              <FilterByTags />
              <FilterByBlockType />
              <ClearFiltersButton />
              <ActionRow.Spacer />
              <SearchSortWidget />
            </ActionRow>
            <LibraryCollectionComponents />
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

export default LibraryCollectionPage;
