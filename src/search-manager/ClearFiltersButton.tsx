import React from 'react';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { Button } from '@openedx/paragon';
import messages from './messages';
import { useSearchContext } from './SearchManager';

type ClearFiltersButtonProps = {
  variant?: 'link' | 'primary',
  size?: 'sm' | 'md' | 'lg' | 'inline',
};

/**
 * A button that appears when at least one filter is active, and will clear the filters when clicked.
 */
const ClearFiltersButton = ({
  variant = 'link',
  size = 'sm',
}: ClearFiltersButtonProps) => {
  const { canClearFilters, clearFilters } = useSearchContext();
  if (canClearFilters) {
    return (
      <Button variant={variant} size={size} onClick={clearFilters}>
        <FormattedMessage {...messages.clearFilters} />
      </Button>
    );
  }
  return null;
};

export default ClearFiltersButton;
