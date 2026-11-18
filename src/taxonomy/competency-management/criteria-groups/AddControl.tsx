import { useEffect, useId, useState } from 'react';
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
  disabledReason: 'placeholder' | 'saving' | 'loading' | 'deleting' | null;
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
  // Lets Escape dismiss the tooltip without moving focus (WCAG 1.4.13). Listening on `document` covers a
  // tooltip opened by hover while focus is elsewhere, and the capture phase keeps the listener working when
  // focus is inside an element that stops the key press.
  useEffect(() => {
    if (!isTooltipOpen) { return undefined; }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setShow(false); }
    };
    document.addEventListener('keydown', closeOnEscape, true);
    return () => document.removeEventListener('keydown', closeOnEscape, true);
  }, [isTooltipOpen]);
  let describedBy: string | undefined;
  // While the tooltip is open the popper appends its id with a comma, which breaks an id list,
  // so the button points at the tooltip alone, which carries the same text.
  if (disabled) {
    describedBy = isTooltipOpen ? tooltipId : descriptionId;
  }
  const reasonMessages = {
    saving: messages.addControlSavingTooltip,
    loading: messages.addControlLoadingTooltip,
    deleting: messages.addControlDeletingTooltip,
    placeholder: messages.addControlDisabledTooltip,
  };
  const reasonText = disabledReason ? intl.formatMessage(reasonMessages[disabledReason]) : '';

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
