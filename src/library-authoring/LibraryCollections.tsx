import React, { useEffect, useMemo } from 'react';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { CardGrid } from '@openedx/paragon';

import messages from './messages';
import { useSearchContext } from '../search-manager';
import { NoComponents, NoSearchResults } from './EmptyStates';
import ComponentCard from './components/ComponentCard';
import { LIBRARY_SECTION_PREVIEW_LIMIT } from './components/LibrarySection';

type LibraryCollectionsProps = {
  libraryId: string,
  variant: 'full' | 'preview',
};

/**
 * Library Collections to show collections grid
 *
 * Use style to:
 *   - 'full': Show all collections with Infinite scroll pagination.
 *   - 'preview': Show first 4 collections without pagination.
 */
const LibraryCollections = ({ libraryId, variant }: LibraryCollectionsProps) => {
  const {
    collectionHits,
    totalCollectionHits,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    isFiltered,
    setExtraFilter,
  } = useSearchContext();

  const collectionList = variant === 'preview' ? collectionHits.slice(0, LIBRARY_SECTION_PREVIEW_LIMIT) : collectionHits;

  useEffect(() => {
    if (variant === 'full') {
      const onscroll = () => {
        // Verify the position of the scroll to implementa a infinite scroll.
        // Used `loadLimit` to fetch next page before reach the end of the screen.
        const loadLimit = 300;
        const scrolledTo = window.scrollY + window.innerHeight;
        const scrollDiff = document.body.scrollHeight - scrolledTo;
        const isNearToBottom = scrollDiff <= loadLimit;
        if (isNearToBottom && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      };
      window.addEventListener('scroll', onscroll);
      return () => {
        window.removeEventListener('scroll', onscroll);
      };
    }
    return () => {};
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (totalCollectionHits === 0) {
    return isFiltered ? <NoSearchResults /> : <NoComponents />;
  }

  return (
    <CardGrid
      columnSizes={{
        sm: 12,
        md: 6,
        lg: 4,
        xl: 3,
      }}
      hasEqualColumnHeights
    >
      { collectionList.map((contentHit) => (
        <ComponentCard
          key={contentHit.id}
          contentHit={contentHit}
          blockTypeDisplayName={'Collection'}
        />
      )) }
    </CardGrid>
  );
};

export default LibraryCollections;
