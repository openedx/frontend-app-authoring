/* eslint-disable react/prop-types */
// @ts-check
import React from 'react';
import { useClearRefinements } from 'react-instantsearch';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { Button } from '@openedx/paragon';
import messages from './messages';

/**
 * A button that appears when at least one filter is active, and will clear the filters when clicked.
 * @type {React.FC<Record<never, never>>}
 */
const ClearFiltersButton = () => {
  const { refine, canRefine } = useClearRefinements();
  if (canRefine) {
    return (
      <Button variant="link" size="sm" onClick={refine}>
        <FormattedMessage {...messages.clearFilters} />
      </Button>
    );
  }
  return null;
};

export default ClearFiltersButton;
