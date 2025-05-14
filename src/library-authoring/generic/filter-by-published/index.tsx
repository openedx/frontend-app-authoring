import React from 'react';
import { useLibraryContext } from '../../common/context/LibraryContext';
import { FilterByPublished, PublishStatus } from '../../../search-manager';

const LibraryFilterByPublished : React.FC<Record<never, never>> = () => {
  const { showOnlyPublished } = useLibraryContext();

  if (showOnlyPublished) {
    return (
      <FilterByPublished visibleFilters={
        [PublishStatus.Published, PublishStatus.Modified]
      }
      />
    );
  }

  return <FilterByPublished />;
};

export default LibraryFilterByPublished;
