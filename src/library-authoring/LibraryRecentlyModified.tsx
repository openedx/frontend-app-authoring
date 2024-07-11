import React from 'react';

import { SearchContextProvider, useSearchContext } from '../search-manager';
import { SearchSortOption } from '../search-manager/data/api';
import LibraryComponents from './components/LibraryComponents';
import LibrarySection from './components/LibrarySection';

const RecentlyModified: React.FC<{ libraryId: string }> = ({ libraryId }) => {
  const { totalHits: componentCount } = useSearchContext();

  return componentCount > 0
    ? (
      <LibrarySection
        title="Recently Modified"
        contentCount={componentCount}
      >
        <LibraryComponents libraryId={libraryId} variant="preview" />
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
