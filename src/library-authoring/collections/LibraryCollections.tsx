import { LoadingSpinner } from '../../generic/Loading';
import { useLoadOnScroll } from '../../hooks';
import { CollectionHit, useSearchContext } from '../../search-manager';
import { NoComponents, NoSearchResults } from '../EmptyStates';
import CollectionCard from '../components/CollectionCard';
import messages from './messages';
import { useLibraryContext } from '../common/context';

/**
 * Library Collections to show collections grid
 *
 * Use style to:
 *   - 'full': Show all collections with Infinite scroll pagination.
 *   - 'preview': Show first 4 collections without pagination.
 */
const LibraryCollections = () => {
  const {
    hits,
    totalHits: totalCollectionHits,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    isLoading,
    isFiltered,
  } = useSearchContext();

  const { openCreateCollectionModal } = useLibraryContext();

  useLoadOnScroll(
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    true,
  );

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (totalCollectionHits === 0) {
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

  return (
    <div className="library-cards-grid">
      {hits.map((collectionHit) => (
        <CollectionCard
          key={collectionHit.id}
          collectionHit={collectionHit as CollectionHit}
        />
      ))}
    </div>
  );
};

export default LibraryCollections;
