/* eslint-disable react/prop-types */
// @ts-check
import React from 'react';
import { useSearchContext } from './manager/SearchManager';
import SearchResult from './SearchResult';

/**
 * A single search result (row), usually represents an XBlock/Component
 * @type {React.FC<Record<never, never>>}
 */
const SearchResults = () => {
  const { hits } = useSearchContext();
  // TODO: pagination
  return <>{hits.map((hit) => <SearchResult key={hit.id} hit={hit} />)}</>;
};

export default SearchResults;
