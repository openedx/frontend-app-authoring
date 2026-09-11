import type { KeyboardEvent, MouseEvent } from 'react';

import { IconButton } from '@openedx/paragon';
import { ExpandLess, ExpandMore } from '@openedx/paragon/icons';

interface ExpandCollapseIconButtonProps {
  canExpand: boolean;
  isExpanded: boolean;
  onToggle?: () => void;
  /** Label for the "expand" action - shown while the row is collapsed. */
  expandLabel: string;
  /** Label for the "collapse" action - shown while the row is expanded. */
  collapseLabel: string;
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
 * `expandLabel`/`collapseLabel` are already-formatted strings, not
 * message objects, so this component stays free of any particular i18n
 * message set - each caller owns its own wording.
 */
const ExpandCollapseIconButton = ({
  canExpand,
  isExpanded,
  onToggle,
  expandLabel,
  collapseLabel,
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

  const label = isExpanded ? collapseLabel : expandLabel;

  // Stops the click from also reaching an enclosing row's own `onClick`, for
  // a caller whose row is independently clickable (e.g. a selectable
  // competency tree row - see `CompetencyTreeItem`) - this button only ever
  // toggles expand/collapse, never whatever the enclosing row's own click
  // does. A caller with no such click handler on its row is unaffected.
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onToggle?.();
  };

  // Same isolation as `handleClick` above, but for the keyboard: this button
  // and an enclosing clickable row can both be focusable/interactive, so
  // pressing Enter or Space here would otherwise also bubble up as a keydown
  // to the row's own key handler, which could cancel this button's own
  // native Enter/Space-activates-the-button behavior (via `preventDefault`)
  // before it can fire a click at all - silently selecting the row instead
  // of toggling expand/collapse. `stopPropagation` (not `preventDefault`) is
  // enough: it only stops the keydown from reaching the row, leaving this
  // button's own native activation - and the `onClick` above that reacts to
  // it - intact.
  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.stopPropagation();
    }
  };

  return (
    <IconButton
      src={isExpanded ? ExpandLess : ExpandMore}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      alt={label}
      aria-label={label}
      aria-expanded={isExpanded}
      size="sm"
      className={className}
    />
  );
};

export default ExpandCollapseIconButton;
