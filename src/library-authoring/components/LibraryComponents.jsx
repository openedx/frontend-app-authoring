// @ts-check
/* eslint-disable react/prop-types */
import React, { useEffect, useMemo } from 'react';

import { CardGrid } from '@openedx/paragon';
import { NoComponents, NoSearchResults } from '../EmptyStates';
import { useLibraryBlockTypes, useLibraryComponentCount, useLibraryComponents } from '../data/apiHook';
import { ComponentCard, ComponentCardLoading } from './ComponentCard';

/**
 * Library Components to show components grid
 *
 * Use style to:
 *   - 'full': Show all components with Infinite scroll pagination.
 *   - 'preview': Show first 4 components without pagination.
 *
 * @type {React.FC<{
 *   libraryId: string,
 *   filter: {
 *     searchKeywords: string,
 *   },
 *   variant: 'full'|'preview',
 * }>}
 */
const LibraryComponents = ({
  libraryId,
  filter: { searchKeywords },
  variant,
}) => {
  const { componentCount } = useLibraryComponentCount(libraryId, searchKeywords);
  const {
    hits,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useLibraryComponents(libraryId, searchKeywords);

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

  const { showLoading, showContent } = useMemo(() => {
    let resultShowLoading = false;
    let resultShowContent = false;

    if (isFetching && !isFetchingNextPage) {
      // First load; show loading but not content.
      resultShowLoading = true;
      resultShowContent = false;
    } else if (isFetchingNextPage) {
      // Load next page; show content and loading.
      resultShowLoading = true;
      resultShowContent = true;
    } else if (!isFetching && !isFetchingNextPage) {
      // State without loads; show content.
      resultShowLoading = false;
      resultShowContent = true;
    }
    return {
      showLoading: resultShowLoading,
      showContent: resultShowContent,
    };
  }, [isFetching, isFetchingNextPage]);

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

  let componentList = hits;
  if (variant === 'preview') {
    componentList = componentList.slice(0, 4);
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
      { showContent ? componentList.map((component) => {
        const tagCount = component.tags?.implicitCount || 0;

        return (
          <ComponentCard
            key={component.id}
            title={component.displayName}
            description={component.formatted.content?.htmlContent ?? ''}
            tagCount={tagCount}
            blockType={component.blockType}
            blockTypeDisplayName={blockTypes[component.blockType]?.displayName ?? ''}
          />
        );
      }) : <ComponentCardLoading />}
      { showLoading && <ComponentCardLoading /> }
    </CardGrid>
  );
};

export default LibraryComponents;
