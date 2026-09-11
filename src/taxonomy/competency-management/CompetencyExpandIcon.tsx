import type { KeyboardEvent, MouseEvent } from 'react';

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

  // Stops the click from also reaching the enclosing row's own `onClick`
  // (a group row is now selectable too - see `CompetencyTreeItem`) - this
  // icon only ever toggles expand/collapse, never selection.
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onToggle();
  };

  // Same isolation as `handleClick` above, but for the keyboard: this button
  // and its enclosing row are both focusable/interactive, so pressing Enter
  // or Space here also bubbles up as a keydown to the row's own `onKeyDown`
  // (`CompetencyTreeItem`'s `handleKeyDown`), which calls `preventDefault()`
  // and selects the row - cancelling this button's own native
  // Enter/Space-activates-the-button behavior before it can fire a click at
  // all. Without this, expanding a row by keyboard silently selects it
  // instead. `stopPropagation` (not `preventDefault`) is enough: it only
  // stops the keydown from reaching the row, leaving the button's own
  // native activation - and the `onClick` above that reacts to it - intact.
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
      alt={buttonLabel}
      aria-label={buttonLabel}
      aria-expanded={isExpanded}
      size="sm"
    />
  );
};

export default CompetencyExpandIcon;
