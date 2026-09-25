import { Chip } from '@openedx/paragon';

export interface CriterionChipProps {
  /** Already resolved by the caller (`CriterionChipList`) - this component
   * never fetches or looks anything up itself.
   */
  displayName: string;
}

/** One chip inside a rule box: the associated subsection's display name,
 * truncated (see `criteria-groups.scss`) rather than wrapping or overflowing
 * for a long one. No remove ("x") affordance: deleting an association is
 * `#709`/`#710`'s scope, not this ticket's.
 */
const CriterionChip = ({ displayName }: CriterionChipProps) => (
  <Chip variant="dark" className="criterion-chip mr-1">{displayName}</Chip>
);

export default CriterionChip;
