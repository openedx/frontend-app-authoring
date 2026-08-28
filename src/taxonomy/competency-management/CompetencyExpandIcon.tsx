import { useIntl } from '@edx/frontend-platform/i18n';
import { IconButton } from '@openedx/paragon';
import { ExpandLess, ExpandMore } from '@openedx/paragon/icons';

import messages from './messages';

interface CompetencyExpandIconProps {
  canExpand: boolean;
  isExpanded: boolean;
  onToggle: () => void;
}

/** CompetencyExpandIcon
 * Disclosure button for one row of the competency tree.
 *
 * Takes plain booleans/callback rather than a TanStack `Row`, since this
 * page's tree is rendered as nested `<ul>/<li>` elements, not table rows.
 * When the row has no children, this renders an invisible, disabled
 * placeholder icon instead of nothing, so every row's label still starts at
 * the same horizontal position.
 */
const CompetencyExpandIcon = ({ canExpand, isExpanded, onToggle }: CompetencyExpandIconProps) => {
  const intl = useIntl();

  if (!canExpand) {
    return (
      <IconButton
        src={ExpandMore}
        alt=""
        size="sm"
        className="invisible"
        disabled
        tabIndex={-1}
        aria-hidden
      />
    );
  }

  const buttonLabel = isExpanded
    ? intl.formatMessage(messages.collapseRowButtonLabel)
    : intl.formatMessage(messages.expandRowButtonLabel);

  return (
    <IconButton
      src={isExpanded ? ExpandLess : ExpandMore}
      onClick={onToggle}
      alt={buttonLabel}
      aria-label={buttonLabel}
      aria-expanded={isExpanded}
      size="sm"
    />
  );
};

export default CompetencyExpandIcon;
