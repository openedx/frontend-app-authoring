import { IconButton } from '@openedx/paragon';
import { ExpandLess, ExpandMore } from '@openedx/paragon/icons';

interface ExpandCollapseIconButtonProps {
  canExpand: boolean;
  isExpanded: boolean;
  onToggle?: () => void;
  /** Label for the "expand" action - shown while the row is collapsed. */
  expandedLabel: string;
  /** Label for the "collapse" action - shown while the row is expanded. */
  collapsedLabel: string;
  className?: string;
}

/** ExpandCollapseIconButton
 * Shared disclosure button for one row of a tree or nested list, toggling
 * between an expanded and a collapsed state.
 *
 * Takes plain booleans/callback rather than a TanStack `Row`, so it works
 * equally for a `<ul>/<li>`-rendered tree and for a table row wrapping one.
 * When the row has no children (`canExpand` is false), this renders an
 * invisible, disabled placeholder icon instead of nothing, so every row's
 * label still starts at the same horizontal position.
 *
 * `expandedLabel`/`collapsedLabel` are already-formatted strings, not
 * message objects, so this component stays free of any particular i18n
 * message set - each caller owns its own wording.
 */
const ExpandCollapseIconButton = ({
  canExpand,
  isExpanded,
  onToggle,
  expandedLabel,
  collapsedLabel,
  className,
}: ExpandCollapseIconButtonProps) => {
  if (!canExpand) {
    return (
      <IconButton
        src={ExpandMore}
        alt=""
        size="sm"
        className={className ? `${className} invisible` : 'invisible'}
        disabled
        tabIndex={-1}
        aria-hidden
      />
    );
  }

  const label = isExpanded ? collapsedLabel : expandedLabel;

  return (
    <IconButton
      src={isExpanded ? ExpandLess : ExpandMore}
      onClick={onToggle}
      alt={label}
      aria-label={label}
      aria-expanded={isExpanded}
      size="sm"
      className={className}
    />
  );
};

export default ExpandCollapseIconButton;
