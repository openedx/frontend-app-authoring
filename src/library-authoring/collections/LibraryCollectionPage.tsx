import { useContext, useEffect } from 'react';
import { StudioFooter } from '@edx/frontend-component-footer';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Badge,
  Button,
  Breadcrumb,
  Container,
  Icon,
  IconButton,
  Stack,
} from '@openedx/paragon';
import { Add, InfoOutline } from '@openedx/paragon/icons';
import { Link, useParams } from 'react-router-dom';

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
import { useCollection, useContentLibrary } from '../data/apiHooks';
import { LibraryContext } from '../common/context';
import messages from './messages';
import { LibrarySidebar } from '../library-sidebar';
import LibraryCollectionComponents from './LibraryCollectionComponents';

const HeaderActions = ({ canEditLibrary }: { canEditLibrary: boolean; }) => {
  const intl = useIntl();
  const {
    openAddContentSidebar,
  } = useContext(LibraryContext);

  if (!canEditLibrary) {
    return null;
  }

  return (
    <div className="header-actions">
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

const SubHeaderTitle = ({
  title,
  canEditLibrary,
  infoClickHandler,
}: {
  title: string;
  canEditLibrary: boolean;
  infoClickHandler: () => void;
}) => {
  const intl = useIntl();

  return (
    <Stack direction="vertical">
      <Stack direction="horizontal" gap={2}>
        {title}
        <IconButton
          src={InfoOutline}
          iconAs={Icon}
          alt={intl.formatMessage(messages.collectionInfoButton)}
          onClick={infoClickHandler}
          variant="primary"
        />
      </Stack>
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

const LibraryCollectionPage = () => {
  const intl = useIntl();

  const { libraryId, collectionId } = useParams();

  if (!collectionId || !libraryId) {
    // istanbul ignore next - This shouldn't be possible; it's just here to satisfy the type checker.
    throw new Error('Rendered without collectionId or libraryId URL parameter');
  }

  const {
    sidebarBodyComponent,
    openCollectionInfoSidebar,
  } = useContext(LibraryContext);

  const {
    data: collectionData,
    isLoading,
    isError,
    error,
  } = useCollection(libraryId, collectionId);

  useEffect(() => {
    openCollectionInfoSidebar(collectionId);
  }, [collectionData]);

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

  const breadcrumbs = [
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
  ];

  return (
    <div className="d-flex">
      <div className="flex-grow-1">
        <Header
          number={libraryData.slug}
          title={libraryData.title}
          org={libraryData.org}
          contextId={libraryId}
          isLibrary
        />
        <Container size="xl" className="px-4 mt-4 mb-5 library-authoring-page">
          <SearchContextProvider
            extraFilter={[`context_key = "${libraryId}"`, `collections.key = "${collectionId}"`]}
            overrideQueries={{ collections: { limit: 0 } }}
          >
            <SubHeader
              title={(
                <SubHeaderTitle
                  title={collectionData.title}
                  canEditLibrary={libraryData.canEditLibrary}
                  infoClickHandler={() => openCollectionInfoSidebar(collectionId)}
                />
              )}
              breadcrumbs={(
                <Breadcrumb
                  ariaLabel={intl.formatMessage(messages.breadcrumbsAriaLabel)}
                  links={breadcrumbs}
                  linkAs={Link}
                />
              )}
              headerActions={<HeaderActions canEditLibrary={libraryData.canEditLibrary} />}
            />
            <SearchKeywordsField className="w-50" placeholder={intl.formatMessage(messages.searchPlaceholder)} />
            <div className="d-flex mt-3 mb-4 align-items-center">
              <FilterByTags />
              <FilterByBlockType />
              <ClearFiltersButton />
              <div className="flex-grow-1" />
              <SearchSortWidget />
            </div>
            <LibraryCollectionComponents libraryId={libraryId} />
          </SearchContextProvider>
        </Container>
        <StudioFooter />
      </div>
      { !!sidebarBodyComponent && (
        <div className="library-authoring-sidebar box-shadow-left-1 bg-white" data-testid="library-sidebar">
          <LibrarySidebar library={libraryData} />
        </div>
      )}
    </div>
  );
};

export default LibraryCollectionPage;
