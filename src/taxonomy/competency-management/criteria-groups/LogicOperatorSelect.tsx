import { useId } from 'react';
import { Dropdown } from '@openedx/paragon';
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
  /** Omitted where only the value is read: renders plain, non-interactive
   * text in that case. Passing it renders the interactive control instead.
   */
  onChange?: (value: CompetencyGroupLogicOperator) => void;
  className?: string;
}

/** Shared any/all (bottom-tier group) or Or/And (connector) control for how
 * a group's children combine. Read-only (plain text) unless `onChange` is
 * given, in which case a controlled Paragon `Dropdown` renders instead,
 * with its trigger label always computed from `value`.
 *
 * Deliberately not Paragon's `SelectMenu`: it's uncontrolled (holds its own
 * "selected" state once a `MenuItem` is clicked), so its trigger would keep
 * showing whatever the author last clicked even after a rejected save left
 * `value` unchanged. `Dropdown` has no equivalent internal state, so a
 * rejected save's rollback is just a matter of never having changed `value`.
 */
const LogicOperatorSelect = ({
  value,
  labels,
  onChange,
  className,
}: LogicOperatorSelectProps) => {
  const label = value === 'AND' ? labels.and : labels.or;
  const toggleId = useId();

  if (!onChange) {
    return <span className={className}>{label}</span>;
  }

  return (
    <Dropdown className={className}>
      <Dropdown.Toggle id={toggleId} variant="link" size="inline">
        {label}
      </Dropdown.Toggle>
      <Dropdown.Menu>
        <Dropdown.Item onClick={() => onChange('AND')}>{labels.and}</Dropdown.Item>
        <Dropdown.Item onClick={() => onChange('OR')}>{labels.or}</Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default LogicOperatorSelect;
