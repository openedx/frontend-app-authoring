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
  className?: string;
}

/** The any/all (bottom-tier group) or Or/And (connector) word for how a group's children combine. */
const LogicOperatorSelect = ({ value, labels, className }: LogicOperatorSelectProps) => (
  <span className={className}>{value === 'AND' ? labels.and : labels.or}</span>
);

export default LogicOperatorSelect;
