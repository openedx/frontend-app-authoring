import React from 'react';
import { StatefulButton } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';

import { ContentHit, useSearchContext } from '../search-manager';
import SearchResult from './SearchResult';
import messages from './messages';

/**
 * All of the single results ("hits"), based on the user's search.
 *
 * Uses "infinite pagination" to load more pages as needed (if users click the
 * "Show more results" button).
 */
const SearchResults: React.FC<Record<never, never>> = () => {
  const intl = useIntl();
  const {
    hits,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useSearchContext();

  const labels = {
    default: intl.formatMessage(messages.showMoreResults),
    pending: intl.formatMessage(messages.loadingMoreResults),
  };

  return (
    <>
      {hits.filter((hit): hit is ContentHit => hit.type !== 'collection').map(
        (hit) => <SearchResult key={hit.id} hit={hit} />,
      )}
      {hasNextPage
        ? (
          <StatefulButton
            className="mt-2"
            variant="primary"
            state={isFetchingNextPage ? 'pending' : 'default'}
            labels={labels}
            onClick={fetchNextPage}
          />
        ) : null}
    </>
  );
};

export default SearchResults;
