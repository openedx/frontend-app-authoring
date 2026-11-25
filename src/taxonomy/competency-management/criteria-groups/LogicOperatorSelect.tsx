import { useId } from 'react';
import { Dropdown } from '@openedx/paragon';
import type { CompetencyGroupLogicOperator } from '../data/types';

export interface LogicOperatorSelectLabels {
  and: string;
  or: string;
}

export interface LogicOperatorSelectProps {
  value: CompetencyGroupLogicOperator;
  /** Supplied by the caller since the same control reads "all"/"any" on a
   * bottom-tier group's bracket and "And"/"Or" on a connector between sibling groups.
   */
  labels: LogicOperatorSelectLabels;
  /** When omitted, renders plain text. When given, renders the interactive control. */
  onChange?: (value: CompetencyGroupLogicOperator) => void;
  className?: string;
}

/** The any/all (bottom-tier group) or Or/And (connector) control for how a group's children combine.
 *
 * Uses a controlled `Dropdown` rather than `SelectMenu`, which keeps its own selected state, so a
 * rejected save would leave its trigger showing the unsaved choice.
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
