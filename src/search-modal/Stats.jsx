/* eslint-disable react/prop-types */
// @ts-check
import React from 'react';
import { useStats, useClearRefinements } from 'react-instantsearch';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import messages from './messages';

/**
 * Simple component that displays the # of matching results
 * @type {React.FC<Record<never, never>>}
 */
const Stats = (props) => {
  const { nbHits, query } = useStats(props);
  const { canRefine: hasFiltersApplied } = useClearRefinements();
  const hasQuery = !!query;

  if (!hasQuery && !hasFiltersApplied) {
    // We haven't started the search yet.
    return null;
  }

  return (
    <FormattedMessage {...messages.numResults} values={{ numResults: nbHits }} />
  );
};

export default Stats;
