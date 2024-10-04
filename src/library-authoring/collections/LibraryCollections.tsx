import { LoadingSpinner } from '../../generic/Loading';
import { useLoadOnScroll } from '../../hooks';
import { useSearchContext } from '../../search-manager';
import { NoComponents, NoSearchResults } from '../EmptyStates';
import CollectionCard from '../components/CollectionCard';
import { LIBRARY_SECTION_PREVIEW_LIMIT } from '../components/LibrarySection';
import messages from './messages';
import { useLibraryContext } from '../common/context';

type LibraryCollectionsProps = {
  variant: 'full' | 'preview',
};

/**
 * Library Collections to show collections grid
 *
 * Use style to:
 *   - 'full': Show all collections with Infinite scroll pagination.
 *   - 'preview': Show first 4 collections without pagination.
 */
const LibraryCollections = ({ variant }: LibraryCollectionsProps) => {
  const {
    collectionHits,
    totalCollectionHits,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    isLoading,
    isFiltered,
  } = useSearchContext();

  const { openCreateCollectionModal } = useLibraryContext();

  const collectionList = variant === 'preview' ? collectionHits.slice(0, LIBRARY_SECTION_PREVIEW_LIMIT) : collectionHits;

  useLoadOnScroll(
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    variant === 'full',
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
      {collectionList.map((collectionHit) => (
        <CollectionCard
          key={collectionHit.id}
          collectionHit={collectionHit}
        />
      ))}
    </div>
  );
};

export default LibraryCollections;
