/* eslint-disable react/prop-types */
// @ts-check
import React from 'react';
import { StatefulButton } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';

import { useSearchContext } from './manager/SearchManager';
import SearchResult from './SearchResult';
import messages from './messages';

/**
 * A single search result (row), usually represents an XBlock/Component
 * @type {React.FC<Record<never, never>>}
 */
const SearchResults = () => {
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
      {hits.map((hit) => <SearchResult key={hit.id} hit={hit} />)}
      {hasNextPage
        ? (
          <StatefulButton
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
