/* eslint-disable react/prop-types */
// @ts-check
import React from 'react';
import { useStats, useClearRefinements } from 'react-instantsearch';

/**
 * If the user hasn't put any keywords/filters yet, display an "empty state".
 * Likewise, if the results are empty (0 results), display a special message.
 * Otherwise, display the results, which are assumed to be the children prop.
 * @type {React.FC<{children: React.ReactElement}>}
 */
const EmptyStates = ({ children }) => {
  const { nbHits, query } = useStats();
  const { canRefine: hasFiltersApplied } = useClearRefinements();
  const hasQuery = !!query;

  if (!hasQuery && !hasFiltersApplied) {
    // We haven't started the search yet. Display the "start your search" empty state
    // Note this isn't localized because it's going to be replaced in a fast-follow PR.
    return <p className="text-muted text-center mt-6">Enter a keyword or select a filter to begin searching.</p>;
  }
  if (nbHits === 0) {
    // Note this isn't localized because it's going to be replaced in a fast-follow PR.
    return <p className="text-muted text-center mt-6">No results found. Change your search and try again.</p>;
  }

  return children;
};

export default EmptyStates;
