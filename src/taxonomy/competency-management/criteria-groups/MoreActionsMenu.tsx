import type { Ref } from 'react';
import { Dropdown, Icon, IconButton } from '@openedx/paragon';
import { MoreVert } from '@openedx/paragon/icons';

interface MoreActionsMenuProps {
  toggleRef?: Ref<HTMLButtonElement>;
  toggleClassName?: string;
  id: string;
  toggleLabel: string;
  removeLabel: string;
  disabled: boolean;
  onRemove: () => void;
}

/** The ⋮ menu of a course group, a rule group or a rule box, with one "remove" item.
 *
 * `Card.Header` clones every action, and the elements inside it, with its own `size`, which would turn the toggle's
 * inline size into the header's. Explicit props instead of children keep that `size` off the toggle.
 */
const MoreActionsMenu = ({
  toggleRef,
  toggleClassName,
  id,
  toggleLabel,
  removeLabel,
  disabled,
  onRemove,
}: MoreActionsMenuProps) => (
  <Dropdown className="more-actions-menu">
    <Dropdown.Toggle
      ref={toggleRef}
      id={id}
      as={IconButton}
      src={MoreVert}
      iconAs={Icon}
      variant="primary"
      className={toggleClassName}
      aria-label={toggleLabel}
      size="inline"
      disabled={disabled}
    />
    <Dropdown.Menu>
      <Dropdown.Item onClick={onRemove}>{removeLabel}</Dropdown.Item>
    </Dropdown.Menu>
  </Dropdown>
);

export default MoreActionsMenu;
