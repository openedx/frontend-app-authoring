import React from 'react';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { Button } from '@openedx/paragon';
import messages from './messages';
import { useSearchContext } from './SearchManager';

type ClearFiltersButtonProps = {
  variant?: 'link' | 'primary',
  size?: 'sm' | 'md' | 'lg' | 'inline',
};

const defaultProps : ClearFiltersButtonProps = {
  variant: 'link',
  size: 'sm',
};

/**
 * A button that appears when at least one filter is active, and will clear the filters when clicked.
 */
const ClearFiltersButton = ({
  variant,
  size,
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

ClearFiltersButton.defaultProps = defaultProps;

export default ClearFiltersButton;
