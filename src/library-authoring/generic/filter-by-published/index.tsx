import React from 'react';
import { usePublishedFilterContext } from '@src/library-authoring/common/context/PublishedFilterContext';
import { FilterByPublished, PublishStatus } from '../../../search-manager';

/**
 * When browsing library content for insertion into a course, we only show published
 * content. In that case, there is no need for a 'Never Published' filter, which will
 * never show results. This component removes that option from FilterByPublished
 * when not relevant.
 */
const LibraryFilterByPublished : React.FC<Record<never, never>> = () => {
  const { showOnlyPublished } = usePublishedFilterContext();

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
