import React, { useEffect, useMemo } from 'react';
import { CardGrid } from '@openedx/paragon';

import { useSearchContext } from '../../search-manager';
import { NoComponents, NoSearchResults } from '../EmptyStates';
import { useLibraryBlockTypes } from '../data/apiHook';
import { ComponentCard, ComponentCardLoading } from './ComponentCard';
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
const LibraryComponents = ({
  libraryId,
  variant,
}: LibraryComponentsProps) => {
  const {
    hits,
    totalHits: componentCount,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    searchKeywords,
  } = useSearchContext();

  const { componentList, tagCounts } = useMemo(() => {
    const result = variant === 'preview' ? hits.slice(0, LIBRARY_SECTION_PREVIEW_LIMIT) : hits;
    const tagsCountsResult = {};
    result.forEach((component) => {
      if (!component.tags) {
        tagsCountsResult[component.id] = 0;
      } else {
        tagsCountsResult[component.id] = (component.tags.level0?.length || 0)
              + (component.tags.level1?.length || 0)
              + (component.tags.level2?.length || 0)
              + (component.tags.level3?.length || 0);
      }
    });
    return {
      componentList: result,
      tagCounts: tagsCountsResult,
    };
  }, [hits]);

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

  const showLoading = isFetching || isFetchingNextPage;

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

  if (componentCount === 0) {
    return searchKeywords === '' ? <NoComponents /> : <NoSearchResults />;
  }

  return (
    <CardGrid
      columnSizes={{
        sm: 12,
        md: 5,
        lg: 4,
        xl: 3,
      }}
      hasEqualColumnHeights
    >
      {componentList.map((component) => (
        <ComponentCard
          key={component.id}
          title={component.displayName}
          description={component.formatted.content?.htmlContent ?? ''}
          tagCount={tagCounts[component.id] || 0}
          blockType={component.blockType}
          blockTypeDisplayName={blockTypes[component.blockType]?.displayName ?? ''}
        />
      ))}
      { showLoading && <ComponentCardLoading /> }
    </CardGrid>
  );
};

export default LibraryComponents;
