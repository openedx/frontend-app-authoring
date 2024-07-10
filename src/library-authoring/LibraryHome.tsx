import React from 'react';
import { Stack } from '@openedx/paragon';

import { NoComponents, NoSearchResults } from './EmptyStates';
import { useSearchContext } from '../search-manager';
import LibraryCollections from './LibraryCollections';
import LibraryComponents from './components/LibraryComponents';
import LibrarySection from './components/LibrarySection';
import LibraryRecentlyModified from './LibraryRecentlyModified';

type LibraryHomeProps = {
  libraryId: string,
};

const LibraryHome = ({ libraryId } : LibraryHomeProps) => {
  const {
    totalHits: componentCount,
    searchKeywords,
  } = useSearchContext();

  const collectionCount = 0;

  const renderEmptyState = () => {
    if (componentCount === 0) {
      return searchKeywords === '' ? <NoComponents /> : <NoSearchResults />;
    }
    return null;
  };

  return (
    <Stack gap={3}>
      <LibraryRecentlyModified libraryId={libraryId} />
      {
        renderEmptyState()
        || (
          <>
            <LibrarySection title={`Collections (${collectionCount})`}>
              <LibraryCollections />
            </LibrarySection>
            <LibrarySection title={`Components (${componentCount})`}>
              <LibraryComponents libraryId={libraryId} variant="preview" />
            </LibrarySection>
          </>
        )
      }
    </Stack>
  );
};

export default LibraryHome;
