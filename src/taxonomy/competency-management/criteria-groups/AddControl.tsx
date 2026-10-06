import { useId } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Button, OverlayTrigger, Tooltip } from '@openedx/paragon';
import { Add } from '@openedx/paragon/icons';
import messages from './messages';

export interface AddControlProps {
  /** The visible label, such as "Rule" or "Rule Group". */
  label: string;
  onClick: React.MouseEventHandler;
  /** True while a placeholder exists, which explains itself in a tooltip. */
  disabled: boolean;
}

/** The "+ Rule" and "+ Rule Group" control, centered between two connector lines.
 * A disabled button fires no hover or focus events, so the tooltip hangs off a
 * focusable wrapper span instead.
 */
const AddControl = ({ label, onClick, disabled }: AddControlProps) => {
  const intl = useIntl();
  const tooltipId = useId();

  const button = (
    <Button
      variant="outline-primary"
      size="sm"
      iconBefore={Add}
      disabled={disabled}
      onClick={onClick}
    >
      <span className="sr-only">{intl.formatMessage(messages.addControlAccessiblePrefix)}{' '}</span>
      {label}
    </Button>
  );

  return (
    <div className="add-control">
      <span className="add-control__line" aria-hidden="true" />
      {disabled ?
        (
          <OverlayTrigger
            placement="top"
            overlay={<Tooltip id={tooltipId}>{intl.formatMessage(messages.addControlDisabledTooltip)}</Tooltip>}
          >
            <span className="add-control__button-wrapper" tabIndex={0}>{button}</span>
          </OverlayTrigger>
        ) :
        button}
      <span className="add-control__line" aria-hidden="true" />
    </div>
  );
};

export default AddControl;
