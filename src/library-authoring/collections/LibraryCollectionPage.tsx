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
  Row,
  Stack,
} from '@openedx/paragon';
import { Add, InfoOutline } from '@openedx/paragon/icons';
import { Link, useParams } from 'react-router-dom';

import Loading from '../../generic/Loading';
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
import messages from '../messages';
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

const LibraryCollectionPage = ({
  libraryId,
  collectionId,
}: {
  libraryId: string;
  collectionId: string;
}) => {
  const intl = useIntl();

  const {
    sidebarBodyComponent,
    openCollectionInfoSidebar,
  } = useContext(LibraryContext);

  useEffect(() => {
    openCollectionInfoSidebar();
  }, []);

  const { data: libraryData, isLoading: isLibLoading } = useContentLibrary(libraryId);
  const { data: collectionData, isLoading: isCollectionLoading } = useCollection(libraryId, collectionId);

  if (isLibLoading || isCollectionLoading) {
    return <Loading />;
  }

  if (!libraryData || !collectionData) {
    return <NotFoundAlert />;
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
      to: ``,
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
          <SubHeader
            title={<SubHeaderTitle
              title={collectionData.title}
              canEditLibrary={libraryData.canEditLibrary}
              infoClickHandler={openCollectionInfoSidebar}
            />}
            breadcrumbs={(
              <Breadcrumb
                ariaLabel={intl.formatMessage(messages.allCollections)}
                links={breadcrumbs}
                linkAs={Link}
              />
            )}
            headerActions={<HeaderActions canEditLibrary={libraryData.canEditLibrary} />}
          />
          <SearchKeywordsField className="w-50" />
          <div className="d-flex mt-3 mb-4 align-items-center">
            <FilterByTags />
            <FilterByBlockType />
            <ClearFiltersButton />
            <div className="flex-grow-1" />
            <SearchSortWidget />
          </div>
          <LibraryCollectionComponents libraryId={libraryId} />
        </Container>
        <StudioFooter />
      </div>
      { !!sidebarBodyComponent && (
        <div className="library-authoring-sidebar box-shadow-left-1 bg-white" data-testid="library-sidebar">
          <LibrarySidebar library={libraryData} collection={collectionData} />
        </div>
      )}
    </div>
  );
};

const LibraryCollectionPageWrapper = () => {
  const { libraryId, collectionId } = useParams();
  if (!collectionId || !libraryId) {
    throw new Error('Rendered without collectionId or libraryId URL parameter');
  }

  return (
    <SearchContextProvider
      extraFilter={[`context_key = "${libraryId}"`, `collections.key = "${collectionId}"`]}
      fetchCollections={false}
    >
      <LibraryCollectionPage libraryId={libraryId} collectionId={collectionId} />
    </SearchContextProvider>
  );
}

export default LibraryCollectionPageWrapper;
