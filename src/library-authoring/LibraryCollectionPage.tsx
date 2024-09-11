import React, { useContext } from 'react';
import classNames from 'classnames';
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
import { useCollection, useContentLibrary } from './data/apiHooks';
import { LibraryContext, SidebarBodyComponentId } from './common/context';
import messages from './messages';

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
  } = useContext(LibraryContext);

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
      <Stack direction="horizontal" gap={2}>
        {title}
        <IconButton
          src={InfoOutline}
          iconAs={Icon}
          alt={intl.formatMessage(messages.collectionInfoButton)}
          onClick={() => {}}
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

const LibraryCollectionPage = ({ libraryId, collectionId }: { libraryId: string, collectionId: string }) => {
  const intl = useIntl();

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
    <div className="d-flex overflow-auto">
      <div className="flex-grow-1 align-content-center">
        <Header
          number={libraryData.slug}
          title={libraryData.title}
          org={libraryData.org}
          contextId={libraryId}
          isLibrary
        />
        <Container size="xl" className="px-4 mt-4 mb-5 library-authoring-page">
          <SubHeader
            title={<SubHeaderTitle title={collectionData.title} canEditLibrary={libraryData.canEditLibrary} />}
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
          <div className="d-flex mt-3 align-items-center">
            <FilterByTags />
            <FilterByBlockType />
            <ClearFiltersButton />
            <div className="flex-grow-1" />
            <SearchSortWidget />
          </div>
        </Container>
        <StudioFooter />
      </div>
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
      extraFilter={`context_key = "${libraryId}"`}
    >
      <LibraryCollectionPage libraryId={libraryId} collectionId={collectionId} />
    </SearchContextProvider>
  );
}

export default LibraryCollectionPageWrapper;
