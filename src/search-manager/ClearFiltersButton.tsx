import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { Button } from '@openedx/paragon';
import messages from './messages';
import { useSearchContext } from './SearchManager';

type ClearFiltersButtonProps = {
  variant?: 'link' | 'primary',
  size?: 'sm' | 'md' | 'lg' | 'inline',
  onClear?: () => void,
  canClear?: boolean,
};

/**
 * A button that appears when at least one filter is active, and will clear the filters when clicked.
 */
const ClearFiltersButton = ({
  variant = 'link',
  size = 'sm',
  onClear,
  canClear,
}: ClearFiltersButtonProps) => {
  const { canClearFilters, clearFilters } = useSearchContext();
  const onClick = () => {
    clearFilters();
    onClear?.();
  };
  if (canClearFilters || canClear) {
    return (
      <Button variant={variant} size={size} onClick={onClick}>
        <FormattedMessage {...messages.clearFilters} />
      </Button>
    );
  }
  return null;
};

export default ClearFiltersButton;
