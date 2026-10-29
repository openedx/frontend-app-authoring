import { Chip } from '@openedx/paragon';
import { Close } from '@openedx/paragon/icons';

export interface CriterionChipProps {
  /** Already resolved by the caller (`CriterionChipList`) - this component
   * never fetches or looks anything up itself.
   */
  displayName: string;
}

/** One chip inside a rule box: the associated subsection's display name,
 * truncated rather than wrapping or overflowing for a long one. The
 * trailing "x" is a plain icon with no handler: deleting an association is
 * out of scope here.
 */
const CriterionChip = ({ displayName }: CriterionChipProps) => (
  <Chip variant="dark" className="criterion-chip mr-1" iconAfter={Close}>{displayName}</Chip>
);

export default CriterionChip;
