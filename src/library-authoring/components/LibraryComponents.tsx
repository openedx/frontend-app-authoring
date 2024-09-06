import React, { useMemo } from 'react';
import { CardGrid } from '@openedx/paragon';

import { useLoadOnScroll, useSearchContext } from '../../search-manager';
import { NoComponents, NoSearchResults } from '../EmptyStates';
import { useLibraryBlockTypes } from '../data/apiHooks';
import ComponentCard from './ComponentCard';
import { LIBRARY_SECTION_PREVIEW_LIMIT } from './LibrarySection';

type LibraryComponentsProps = {
  libraryId: string,
  variant: 'full' | 'preview',
};

/**
 * Library Components to show components grid
 *
 * Use style to:
 *   - 'full': Show all components with Infinite scroll pagination.
 *   - 'preview': Show first 4 components without pagination.
 */
const LibraryComponents = ({ libraryId, variant }: LibraryComponentsProps) => {
  const {
    hits,
    totalHits: componentCount,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    isFiltered,
  } = useSearchContext();

  const componentList = variant === 'preview' ? hits.slice(0, LIBRARY_SECTION_PREVIEW_LIMIT) : hits;

  // TODO add this to LibraryContext
  const { data: blockTypesData } = useLibraryBlockTypes(libraryId);
  const blockTypes = useMemo(() => {
    const result = {};
    if (blockTypesData) {
      blockTypesData.forEach(blockType => {
        result[blockType.blockType] = blockType;
      });
    }
    return result;
  }, [blockTypesData]);

  useLoadOnScroll(
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    variant === 'full',
  );

  if (componentCount === 0) {
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
      { componentList.map((contentHit) => (
        <ComponentCard
          key={contentHit.id}
          contentHit={contentHit}
          blockTypeDisplayName={blockTypes[contentHit.blockType]?.displayName ?? ''}
        />
      )) }
    </CardGrid>
  );
};

export default LibraryComponents;
