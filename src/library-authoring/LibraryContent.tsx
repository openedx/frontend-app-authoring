import { useEffect } from 'react';
import { LoadingSpinner } from '../generic/Loading';
import { useSearchContext } from '../search-manager';
import { NoComponents, NoSearchResults } from './EmptyStates';
import { useLibraryContext } from './common/context';
import CollectionCard from './components/CollectionCard';
import ComponentCard from './components/ComponentCard';
import { useLoadOnScroll } from '../hooks';
import messages from './collections/messages';

export enum ContentType {
  home = '',
  components = 'components',
  collections = 'collections',
}

/**
 * Library Content to show content grid
 *
 * Use content to:
 *   - 'collections': Suggest to create a collection on empty state.
*   - Anything else to suggest to add content on empty state.
 */

type LibraryContentProps = {
  contentType?: ContentType;
};

const LibraryContent = ({ contentType = ContentType.home }: LibraryContentProps) => {
  const {
    hits,
    totalHits,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    isLoading,
    isFiltered,
    usageKey,
  } = useSearchContext();
  const { openAddContentSidebar, openComponentInfoSidebar, openCreateCollectionModal } = useLibraryContext();

  useEffect(() => {
    if (usageKey) {
      openComponentInfoSidebar(usageKey);
    }
  }, [usageKey]);

  useLoadOnScroll(
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    true,
  );

  if (isLoading) {
    return <LoadingSpinner />;
  }
  if (totalHits === 0) {
    if (contentType === ContentType.collections) {
      return isFiltered
        ? <NoSearchResults infoText={messages.noSearchResultsCollections} />
        : (
          <NoComponents
            infoText={messages.noCollections}
            addBtnText={messages.addCollection}
            handleBtnClick={openCreateCollectionModal}
          />
        );
    }
    return isFiltered ? <NoSearchResults /> : <NoComponents handleBtnClick={openAddContentSidebar} />;
  }

  return (
    <div className="library-cards-grid">
      {hits.map((contentHit) => (
        contentHit.type === 'collection' ? (
          <CollectionCard
            key={contentHit.id}
            collectionHit={contentHit}
          />
        ) : (
          <ComponentCard
            key={contentHit.id}
            contentHit={contentHit}
          />
        )
      ))}
    </div>
  );
};

export default LibraryContent;
