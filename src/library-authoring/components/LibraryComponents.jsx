// @ts-check
/* eslint-disable react/prop-types */
import React from 'react';

import { CardGrid } from '@openedx/paragon';
import { NoComponents, NoSearchResults } from '../EmptyStates';
import { useLibraryComponentCount, useLibraryComponents } from '../data/apiHook';
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
  const { hits, isFetching } = useLibraryComponents(libraryId, searchKeywords);

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
      { isFetching ? <ComponentCard isLoading />
        : hits.map((component) => {
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
            />
          );
        })}

    </CardGrid>
  );
};

export default LibraryComponents;
