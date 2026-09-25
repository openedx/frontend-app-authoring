import { MenuItem, SelectMenu } from '@openedx/paragon';
import type { CompetencyGroupLogicOperator } from '../data/types';

export interface LogicOperatorSelectLabels {
  and: string;
  or: string;
}

export interface LogicOperatorSelectProps {
  value: CompetencyGroupLogicOperator;
  /** Display text for each of the two states - "all"/"any" on a bottom-tier
   * group's own bracket, "And"/"Or" on a connector between sibling groups.
   * Supplied by the caller rather than looked up here, since the same
   * control serves both contexts with different wording.
   */
  labels: LogicOperatorSelectLabels;
  /** Omitted by `#672`, which only ever reads this value: renders plain,
   * non-interactive text in that case. A later ticket that lets a user
   * change the operator passes this to get the interactive `SelectMenu`
   * instead.
   */
  onChange?: (value: CompetencyGroupLogicOperator) => void;
  className?: string;
}

/** Shared any/all (bottom-tier group) or Or/And (connector) control for how
 * a group's children combine. Read-only (plain text) unless `onChange` is
 * given, per the plan's architecture decision to shape this for later
 * editing without building that editing UI now.
 */
const LogicOperatorSelect = ({
  value,
  labels,
  onChange,
  className,
}: LogicOperatorSelectProps) => {
  const label = value === 'and' ? labels.and : labels.or;

  if (!onChange) {
    return <span className={className}>{label}</span>;
  }

  return (
    <SelectMenu
      className={className}
      defaultMessage={label}
    >
      <MenuItem onClick={() => onChange('and')}>{labels.and}</MenuItem>
      <MenuItem onClick={() => onChange('or')}>{labels.or}</MenuItem>
    </SelectMenu>
  );
};

export default LogicOperatorSelect;
