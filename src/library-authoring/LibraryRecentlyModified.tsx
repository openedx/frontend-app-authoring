import { useIntl } from '@edx/frontend-platform/i18n';
import { orderBy } from 'lodash';

import { SearchContextProvider, useSearchContext } from '../search-manager';
import { type CollectionHit, type ContentHit, SearchSortOption } from '../search-manager/data/api';
import LibrarySection, { LIBRARY_SECTION_PREVIEW_LIMIT } from './components/LibrarySection';
import messages from './messages';
import ComponentCard from './components/ComponentCard';
import CollectionCard from './components/CollectionCard';
import { useLibraryContext } from './common/context';

const RecentlyModified: React.FC<Record<never, never>> = () => {
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

  return componentCount > 0
    ? (
      <LibrarySection
        title={intl.formatMessage(messages.recentlyModifiedTitle)}
        contentCount={componentCount}
      >
        <div className="library-cards-grid">
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
              />
            )
          ))}
        </div>
      </LibrarySection>
    )
    : null;
};

const LibraryRecentlyModified: React.FC<Record<never, never>> = () => {
  const { libraryId } = useLibraryContext();
  return (
    <SearchContextProvider
      extraFilter={`context_key = "${libraryId}"`}
      overrideSearchSortOrder={SearchSortOption.RECENTLY_MODIFIED}
    >
      <RecentlyModified />
    </SearchContextProvider>
  );
};

export default LibraryRecentlyModified;
