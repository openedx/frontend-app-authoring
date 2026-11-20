import { useIntl } from '@edx/frontend-platform/i18n';
import { useCompetencyAssociations } from '../CompetencyAssociationsContext';
import type { CompetencyCriterion } from '../data/types';
import CriterionChip from './CriterionChip';
import messages from './messages';

export interface CriterionChipListProps {
  criteria: CompetencyCriterion[];
  /** A criterion whose `objectId` has no entry here (deleted content or
   * search-index lag) shows the text "Content unavailable".
   */
  subsectionNamesByUsageKey: Record<string, string>;
  /** Shows each chip's remove icon. */
  canEdit?: boolean;
}

/** The chips inside one rule box, one per criterion. */
const CriterionChipList = ({ criteria, subsectionNamesByUsageKey, canEdit = false }: CriterionChipListProps) => {
  const intl = useIntl();
  const { removeAssociation, isDeleting } = useCompetencyAssociations();

  return (
    <div className="criterion-chip-list d-flex flex-wrap">
      {criteria.map((criterion) => (
        <CriterionChip
          key={criterion.id}
          displayName={subsectionNamesByUsageKey[criterion.objectId] ??
            intl.formatMessage(messages.unknownSubsectionLabel)}
          disabled={isDeleting}
          onRemove={canEdit ? () => removeAssociation(criterion.id, 'group') : undefined}
        />
      ))}
    </div>
  );
};

export default CriterionChipList;
