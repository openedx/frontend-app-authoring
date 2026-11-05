import { Chip } from '@openedx/paragon';

export interface CriterionChipProps {
  displayName: string;
}

/** One chip inside a rule box: the associated subsection's display name,
 * truncated rather than wrapping or overflowing for a long one.
 */
const CriterionChip = ({ displayName }: CriterionChipProps) => (
  <Chip variant="dark" className="criterion-chip mr-1">{displayName}</Chip>
);

export default CriterionChip;
