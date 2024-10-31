import { useEffect } from 'react';

import { LoadingSpinner } from '../../generic/Loading';
import { useLoadOnScroll } from '../../hooks';
import { ContentHit, useSearchContext } from '../../search-manager';
import { NoComponents, NoSearchResults } from '../EmptyStates';
import ComponentCard from './ComponentCard';
import { useLibraryContext } from '../common/context';


/**
 * Library Components to show components grid
 *
 * Use style to:
 *   - 'full': Show all components with Infinite scroll pagination.
 *   - 'preview': Show first 4 components without pagination.
 */
const LibraryComponents = () => {
  const {
    hits,
    totalHits: componentCount,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    isLoading,
    isFiltered,
    usageKey,
  } = useSearchContext();
  const { openAddContentSidebar, openComponentInfoSidebar } = useLibraryContext();

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

  if (componentCount === 0) {
    return isFiltered ? <NoSearchResults /> : <NoComponents handleBtnClick={openAddContentSidebar} />;
  }

  return (
    <div className="library-cards-grid">
      { hits.map((contentHit) => (
        <ComponentCard
          key={contentHit.id}
          contentHit={contentHit as ContentHit}
        />
      )) }
    </div>
  );
};

export default LibraryComponents;
