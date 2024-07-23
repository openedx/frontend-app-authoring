import React from 'react';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import messages from './messages';
import { useSearchContext } from './SearchManager';

/**
 * Simple component that displays the # of matching results
 */
const Stats: React.FC<Record<never, never>> = () => {
  const { totalHits, searchKeywords, canClearFilters } = useSearchContext();

  if (!searchKeywords && !canClearFilters) {
    // We haven't started the search yet.
    return null;
  }

  return (
    <FormattedMessage {...messages.numResults} values={{ numResults: totalHits }} />
  );
};

export default Stats;
