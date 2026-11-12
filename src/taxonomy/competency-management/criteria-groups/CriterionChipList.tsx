import { useIntl } from '@edx/frontend-platform/i18n';
import type { CompetencyCriterion } from '../data/types';
import CriterionChip from './CriterionChip';
import messages from './messages';

export interface CriterionChipListProps {
  criteria: CompetencyCriterion[];
  /** A criterion whose `objectId` has no entry here (deleted content or
   * search-index lag) shows the text "Content unavailable".
   */
  subsectionNamesByUsageKey: Record<string, string>;
}

/** The chips inside one rule box, one per criterion. */
const CriterionChipList = ({ criteria, subsectionNamesByUsageKey }: CriterionChipListProps) => {
  const intl = useIntl();

  return (
    <div className="criterion-chip-list d-flex flex-wrap">
      {criteria.map((criterion) => (
        <CriterionChip
          key={criterion.id}
          displayName={subsectionNamesByUsageKey[criterion.objectId] ??
            intl.formatMessage(messages.unknownSubsectionLabel)}
        />
      ))}
    </div>
  );
};

export default CriterionChipList;
