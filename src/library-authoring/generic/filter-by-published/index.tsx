import React from 'react';
import { useLibraryContext } from '../../common/context/LibraryContext';
import { FilterByPublished, PublishStatus } from '../../../search-manager';

/**
 * When browsing library content for insertion into a course, we only show published
 * content. In that case, there is no need for a 'Never Published' filter, which will
 * never show results. This component removes that option from FilterByPublished
 * when not relevant.
 */
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
