import React, { useEffect, useMemo } from 'react';
import { FormattedMessage } from '@edx/frontend-platform/i18n';

import messages from './messages';
import { useSearchContext } from '../search-manager';

type LibraryCollectionsProps = {
  libraryId: string,
  variant: 'full' | 'preview',
};

/**
 * Library Collections to show collections grid
 *
 * Use style to:
 *   - 'full': Show all collections with Infinite scroll pagination.
 *   - 'preview': Show first 4 collections without pagination.
 */
const LibraryCollections = ({ libraryId, variant }: LibraryCollectionsProps) => {
  const {
    collectionHits,
    totalCollectionHits,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    isFiltered,
    setExtraFilter,
  } = useSearchContext();

    // __AUTO_GENERATED_PRINT_VAR_START__
    console.log("LibraryCollections collectionHits: ", collectionHits); // __AUTO_GENERATED_PRINT_VAR_END__
  return <div className="d-flex my-6 justify-content-center">
  </div>
};

export default LibraryCollections;
