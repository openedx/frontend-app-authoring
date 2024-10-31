import { LoadingSpinner } from '../generic/Loading';
import { CollectionHit, ContentHit, useSearchContext } from '../search-manager';
import { NoComponents, NoSearchResults } from './EmptyStates';
import { useLibraryContext } from './common/context';
import CollectionCard from './components/CollectionCard';
import ComponentCard from './components/ComponentCard';
import { useLoadOnScroll } from '../hooks';

const LibraryHome = () => {
  const {
    hits,
    totalHits,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    isLoading,
    isFiltered,
  } = useSearchContext();
  const { openAddContentSidebar } = useLibraryContext();

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
    return isFiltered ? <NoSearchResults /> : <NoComponents handleBtnClick={openAddContentSidebar} />;
  }

  return (
    <div className="library-cards-grid">
      {hits.map((contentHit) => (
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
  );
};

export default LibraryHome;
