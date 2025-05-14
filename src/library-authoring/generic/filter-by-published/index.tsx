import React from 'react';
import { useLibraryContext } from '../../common/context/LibraryContext';
import { FilterByPublished, PublishStatus } from '../../../search-manager';

const LibraryFilterByPublished : React.FC<Record<never, never>> = () => {
  const { showOnlyPublished } = useLibraryContext();
  const publishedFilters = [PublishStatus.Published, PublishStatus.Modified];
  if (!showOnlyPublished) {
    publishedFilters.push(PublishStatus.NeverPublished);
  }

  return (
    <FilterByPublished visibleFilters={publishedFilters} />
  );
};

export default LibraryFilterByPublished;
