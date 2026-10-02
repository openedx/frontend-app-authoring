import { useId } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Button, OverlayTrigger, Tooltip } from '@openedx/paragon';
import { Add } from '@openedx/paragon/icons';
import messages from './messages';

export interface AddControlProps {
  /** "+ Rule" or "+ Rule Group" - see `messages.addRuleButtonLabel`/`addRuleGroupButtonLabel`. */
  label: string;
  onClick: React.MouseEventHandler;
  /** True while a placeholder (a rule box or a whole group) already exists
   * anywhere in the tree - only one can exist at a time. Shows a tooltip
   * explaining why, since a disabled `Button` itself fires no mouse events
   * (so it can't show a title/tooltip of its own).
   */
  disabled: boolean;
}

/** The "+ Rule"/"+ Rule Group" control shared by `CriteriaGroupBox` (a
 * bottom-tier group's own rule boxes) and `CourseGroupSection` (a
 * course-level group's own bottom-tier groups), centered between two
 * connector-style lines matching `GroupConnector`'s own look. Disabled with
 * an explanatory tooltip while a placeholder already exists elsewhere -
 * wrapped in a keyboard-focusable `<span>` so the tooltip is reachable
 * without a mouse, since a disabled `Button` can't receive focus or fire
 * hover/focus events itself.
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
