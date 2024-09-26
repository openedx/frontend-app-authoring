import { LoadingSpinner } from '../../generic/Loading';
import { useLoadOnScroll } from '../../hooks';
import { useSearchContext } from '../../search-manager';
import { NoComponents, NoSearchResults } from '../EmptyStates';
import ComponentCard from './ComponentCard';
import { LIBRARY_SECTION_PREVIEW_LIMIT } from './LibrarySection';
import { useLibraryContext } from '../common/context';

type LibraryComponentsProps = {
  variant: 'full' | 'preview',
};

/**
 * Library Components to show components grid
 *
 * Use style to:
 *   - 'full': Show all components with Infinite scroll pagination.
 *   - 'preview': Show first 4 components without pagination.
 */
const LibraryComponents = ({ variant }: LibraryComponentsProps) => {
  const {
    hits,
    totalHits: componentCount,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    isLoading,
    isFiltered,
  } = useSearchContext();
  const { openAddContentSidebar } = useLibraryContext();

  const componentList = variant === 'preview' ? hits.slice(0, LIBRARY_SECTION_PREVIEW_LIMIT) : hits;

  useLoadOnScroll(
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    variant === 'full',
  );

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (componentCount === 0) {
    return isFiltered ? <NoSearchResults /> : <NoComponents handleBtnClick={openAddContentSidebar} />;
  }

  return (
    <div className="library-cards-grid">
      { componentList.map((contentHit) => (
        <ComponentCard
          key={contentHit.id}
          contentHit={contentHit}
        />
      )) }
    </div>
  );
};

export default LibraryComponents;
