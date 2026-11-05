import { Chip } from '@openedx/paragon';

export interface CriterionChipProps {
  displayName: string;
}

const CriterionChip = ({ displayName }: CriterionChipProps) => (
  <Chip variant="dark" className="criterion-chip mr-1">{displayName}</Chip>
);

export default CriterionChip;
