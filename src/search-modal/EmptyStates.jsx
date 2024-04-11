/* eslint-disable react/prop-types */
// @ts-check
import React from 'react';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { Stack } from '@openedx/paragon';
import { useStats, useClearRefinements } from 'react-instantsearch';

import EmptySearchImage from './images/empty-search.svg';
import NoResultImage from './images/no-results.svg';
import messages from './messages';

const EmptySearch = () => (
  <Stack className="d-flex mt-6 align-items-center">
    <p className="fs-large"> <FormattedMessage {...messages.emptySearchTitle} /> </p>
    <p className="small text-muted"> <FormattedMessage {...messages.emptySearchSubtitle} /> </p>
    <img src={EmptySearchImage} alt="" />
  </Stack>
);

const NoResults = () => (
  <Stack className="d-flex mt-6 align-items-center">
    <p className="fs-large"> <FormattedMessage {...messages.noResultsTitle} /> </p>
    <p className="small text-muted"> <FormattedMessage {...messages.noResultsSubtitle} /> </p>
    <img src={NoResultImage} alt="" />
  </Stack>
);

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
    return <EmptySearch />;
  }
  if (nbHits === 0) {
    return <NoResults />;
  }

  return children;
};

export default EmptyStates;
