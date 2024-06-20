// @ts-check
/* eslint-disable react/prop-types */
import React, { useEffect, useMemo } from 'react';

import { CardGrid } from '@openedx/paragon';
import { NoComponents, NoSearchResults } from '../EmptyStates';
import { useLibraryBlockTypes, useLibraryComponentCount, useLibraryComponents } from '../data/apiHook';
import ComponentCard from './ComponentCard';

/**
 * @type {React.FC<{
 *   libraryId: string,
 *   filter: {
 *     searchKeywords: string,
 *   },
 * }>}
 */
const LibraryComponents = ({ libraryId, filter: { searchKeywords } }) => {
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
      { showContent ? hits.map((component) => {
        let tagCount = 0;
        if (component.tags) {
          tagCount = component.tags.implicitCount || 0;
        }

        return (
          <ComponentCard
            title={component.displayName}
            description={component.formatted.content?.htmlContent ?? ''}
            tagCount={tagCount}
            blockType={component.blockType}
            blockTypeDisplayName={blockTypes[component.blockType]?.displayName ?? ''}
          />
        );
      }) : <ComponentCard isLoading />}
      { showLoading && <ComponentCard isLoading /> }
    </CardGrid>
  );
};

export default LibraryComponents;
