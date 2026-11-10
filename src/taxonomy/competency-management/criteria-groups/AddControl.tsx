import { useId, useState } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Button,
  OverlayTrigger,
  Stack,
  Tooltip,
} from '@openedx/paragon';
import { Add } from '@openedx/paragon/icons';
import messages from './messages';

export interface AddControlProps {
  /** The visible label, such as "Rule" or "Rule Group". */
  label: string;
  /** The accessible name, such as "Add Rule". */
  accessibleLabel: string;
  onClick: React.MouseEventHandler;
  /** Why the control is disabled, or `null` when it is enabled. */
  disabledReason: 'placeholder' | 'saving' | null;
}

/** The "+ Rule" and "+ Rule Group" control, centered between two connector lines.
 * A disabled control keeps `aria-disabled` instead of `disabled`, so it stays focusable and the
 * tooltip opens on focus as well as hover.
 */
const AddControl = ({
  label,
  accessibleLabel,
  onClick,
  disabledReason,
}: AddControlProps) => {
  const intl = useIntl();
  const tooltipId = useId();
  const descriptionId = useId();
  const [show, setShow] = useState(false);
  const disabled = disabledReason !== null;
  const isTooltipOpen = disabled && show;
  let describedBy: string | undefined;
  if (disabled) {
    describedBy = isTooltipOpen ? tooltipId : descriptionId;
  }
  const reasonText = intl.formatMessage(
    disabledReason === 'saving' ? messages.addControlSavingTooltip : messages.addControlDisabledTooltip,
  );

  return (
    <Stack direction="horizontal" gap={2} className="add-control">
      <span className="connector-line" aria-hidden="true" />
      <OverlayTrigger
        placement="top"
        trigger={['hover', 'focus']}
        show={isTooltipOpen}
        onToggle={setShow}
        overlay={<Tooltip id={tooltipId}>{reasonText}</Tooltip>}
      >
        <Button
          variant="outline-primary"
          size="sm"
          iconBefore={Add}
          aria-label={accessibleLabel}
          aria-disabled={disabled}
          // While the tooltip is open the popper appends its id with a comma, which breaks an id list,
          // so the button points at the tooltip alone, which carries the same text.
          aria-describedby={describedBy}
          onClick={disabled ? undefined : onClick}
        >
          {label}
        </Button>
      </OverlayTrigger>
      <span id={descriptionId} className="sr-only">{disabled ? reasonText : ''}</span>
      <span className="connector-line" aria-hidden="true" />
    </Stack>
  );
};

export default AddControl;
