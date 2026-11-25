import type { Ref } from 'react';
import { Dropdown, Icon, IconButton } from '@openedx/paragon';
import { MoreVert } from '@openedx/paragon/icons';

interface GroupActionsMenuProps {
  toggleRef: Ref<HTMLButtonElement>;
  id: string;
  toggleLabel: string;
  removeLabel: string;
  disabled: boolean;
  onRemove: () => void;
}

/** The ⋮ menu of a course group or rule group card, with one "remove" item.
 *
 * `Card.Header` clones every action, and the elements inside it, with its own `size`, which would turn the toggle's
 * inline size into the header's. Explicit props instead of children keep that `size` off the toggle.
 */
const GroupActionsMenu = ({ toggleRef, id, toggleLabel, removeLabel, disabled, onRemove }: GroupActionsMenuProps) => (
  <Dropdown className="group-actions-menu">
    <Dropdown.Toggle
      ref={toggleRef}
      id={id}
      as={IconButton}
      src={MoreVert}
      iconAs={Icon}
      variant="primary"
      aria-label={toggleLabel}
      size="inline"
      disabled={disabled}
    />
    <Dropdown.Menu>
      <Dropdown.Item onClick={onRemove}>{removeLabel}</Dropdown.Item>
    </Dropdown.Menu>
  </Dropdown>
);

export default GroupActionsMenu;
