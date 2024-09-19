import React, { useMemo } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { orderBy } from 'lodash';
import { CardGrid } from '@openedx/paragon';

import { SearchContextProvider, useSearchContext } from '../search-manager';
import { type CollectionHit, type ContentHit, SearchSortOption } from '../search-manager/data/api';
import LibrarySection, { LIBRARY_SECTION_PREVIEW_LIMIT } from './components/LibrarySection';
import messages from './messages';
import ComponentCard from './components/ComponentCard';
import { useLibraryBlockTypes } from './data/apiHooks';
import CollectionCard from './components/CollectionCard';

const RecentlyModified: React.FC<{ libraryId: string }> = ({ libraryId }) => {
  const intl = useIntl();
  const {
    hits,
    collectionHits,
    totalHits,
    totalCollectionHits,
  } = useSearchContext();

  const componentCount = totalHits + totalCollectionHits;
  // Since we only display a fixed number of items in preview,
  // only these number of items are use in sort step below
  const componentList = hits.slice(0, LIBRARY_SECTION_PREVIEW_LIMIT);
  const collectionList = collectionHits.slice(0, LIBRARY_SECTION_PREVIEW_LIMIT);
  // Sort them by `modified` field in reverse and display them
  const recentItems = orderBy([
    ...componentList,
    ...collectionList,
  ], ['modified'], ['desc']).slice(0, LIBRARY_SECTION_PREVIEW_LIMIT);

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

  return componentCount > 0
    ? (
      <LibrarySection
        title={intl.formatMessage(messages.recentlyModifiedTitle)}
        contentCount={componentCount}
      >
        <CardGrid
          columnSizes={{
            sm: 12,
            md: 6,
            lg: 4,
            xl: 3,
          }}
          hasEqualColumnHeights
        >
          {recentItems.map((contentHit) => (
            contentHit.type === 'collection' ? (
              <CollectionCard
                key={contentHit.id}
                collectionHit={contentHit as CollectionHit}
              />
            ) : (
              <ComponentCard
                key={contentHit.id}
                contentHit={contentHit as ContentHit}
                blockTypeDisplayName={blockTypes[(contentHit as ContentHit).blockType]?.displayName ?? ''}
              />
            )
          ))}
        </CardGrid>
      </LibrarySection>
    )
    : null;
};

const LibraryRecentlyModified: React.FC<{ libraryId: string }> = ({ libraryId }) => (
  <SearchContextProvider
    extraFilter={`context_key = "${libraryId}"`}
    overrideSearchSortOrder={SearchSortOption.RECENTLY_MODIFIED}
  >
    <RecentlyModified libraryId={libraryId} />
  </SearchContextProvider>
);

export default LibraryRecentlyModified;
