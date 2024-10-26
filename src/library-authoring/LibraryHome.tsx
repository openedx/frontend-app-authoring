import { useIntl } from '@edx/frontend-platform/i18n';

import { Stack, StatefulButton } from '@openedx/paragon';
import { LoadingSpinner } from '../generic/Loading';
import { CollectionHit, ContentHit, useSearchContext } from '../search-manager';
import { NoComponents, NoSearchResults } from './EmptyStates';
import { useLibraryContext } from './common/context';
import CollectionCard from './components/CollectionCard';
import ComponentCard from './components/ComponentCard';
import messages from './messages';

const LibraryHome = () => {
  const intl = useIntl();
  const {
    totalContentAndCollectionHits: totalHits,
    isLoading,
    isFiltered,
    contentAndCollectionHits,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useSearchContext();
  const { openAddContentSidebar } = useLibraryContext();

  const labels = {
    default: intl.formatMessage(messages.showMoreContent),
    pending: intl.formatMessage(messages.loadingMoreContent),
  };

  const renderEmptyState = () => {
    if (isLoading) {
      return <LoadingSpinner />;
    }
    if (totalHits === 0) {
      return isFiltered ? <NoSearchResults /> : <NoComponents handleBtnClick={openAddContentSidebar} />;
    }
    return null;
  };

  return (
    renderEmptyState()
    || (
      <Stack>
        <div className="library-cards-grid">
          {contentAndCollectionHits.map((contentHit) => (
            contentHit.type === 'collection' ? (
              <CollectionCard
                key={contentHit.id}
                collectionHit={contentHit as CollectionHit}
              />
            ) : (
              <ComponentCard
                key={contentHit.id}
                contentHit={contentHit as ContentHit}
              />
            )
          ))}
        </div>
        {hasNextPage
          ? (
            <StatefulButton
              className="mt-4 align-self-center"
              variant="primary"
              state={isFetchingNextPage ? 'pending' : 'default'}
              labels={labels}
              onClick={fetchNextPage}
            />
          ) : null}
      </Stack>
    )
  );
};

export default LibraryHome;
