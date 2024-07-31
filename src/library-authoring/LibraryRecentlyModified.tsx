import React from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';

import { SearchContextProvider, useSearchContext } from '../search-manager';
import { SearchSortOption } from '../search-manager/data/api';
import LibraryComponents from './components/LibraryComponents';
import LibrarySection from './components/LibrarySection';
import messages from './messages';

interface RecentlyModifiedProps {
  libraryId: string,
  canEditLibrary: boolean,
}

const RecentlyModified = ({ libraryId, canEditLibrary } : RecentlyModifiedProps) => {
  const intl = useIntl();
  const { totalHits: componentCount } = useSearchContext();

  return componentCount > 0
    ? (
      <LibrarySection
        title={intl.formatMessage(messages.recentlyModifiedTitle)}
        contentCount={componentCount}
      >
        <LibraryComponents libraryId={libraryId} variant="preview" canEditLibrary={canEditLibrary} />
      </LibrarySection>
    )
    : null;
};

const LibraryRecentlyModified = ({ libraryId, canEditLibrary } : RecentlyModifiedProps) => (
  <SearchContextProvider
    extraFilter={`context_key = "${libraryId}"`}
    overrideSearchSortOrder={SearchSortOption.RECENTLY_MODIFIED}
  >
    <RecentlyModified libraryId={libraryId} canEditLibrary={canEditLibrary} />
  </SearchContextProvider>
);

export default LibraryRecentlyModified;
