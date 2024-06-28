import React from 'react';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { Button } from '@openedx/paragon';
import messages from './messages';
import { useSearchContext } from './manager/SearchManager';

/**
 * A button that appears when at least one filter is active, and will clear the filters when clicked.
 */
const ClearFiltersButton: React.FC<Record<never, never>> = () => {
  const { canClearFilters, clearFilters } = useSearchContext();
  if (canClearFilters) {
    return (
      <Button variant="link" size="sm" onClick={clearFilters}>
        <FormattedMessage {...messages.clearFilters} />
      </Button>
    );
  }
  return null;
};

export default ClearFiltersButton;
