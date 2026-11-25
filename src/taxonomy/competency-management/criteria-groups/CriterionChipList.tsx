import { useIntl } from '@edx/frontend-platform/i18n';
import { useCompetencyAssociations } from '@src/taxonomy/competency-management/CompetencyAssociationsContext';
import type { CompetencyCriterion } from '../data/types';
import CriterionChip from './CriterionChip';
import messages from './messages';

export interface CriterionChipListProps {
  criteria: CompetencyCriterion[];
  /** A criterion whose `objectId` has no entry here (deleted content, or a cached outline that predates the
   * subsection) renders as an unavailable chip.
   */
  subsectionNamesByUsageKey: Record<string, string>;
  /** Name of the course these criteria belong to, read aloud for an unavailable chip. */
  courseName?: string;
  /** Shows each chip's remove icon. */
  canEdit?: boolean;
}

/** The chips inside one rule box, one per criterion. */
const CriterionChipList = ({
  criteria,
  subsectionNamesByUsageKey,
  courseName,
  canEdit = false,
}: CriterionChipListProps) => {
  const intl = useIntl();
  const { removeCriterion, isDeletingGroupOrRuleBoxOrCriterion, isAssociating } = useCompetencyAssociations();

  return (
    <div className="criterion-chip-list d-flex flex-wrap">
      {criteria.map((criterion) => {
        const subsectionName = subsectionNamesByUsageKey[criterion.objectId];
        const unavailable = subsectionName === undefined;
        return (
          <CriterionChip
            key={criterion.id}
            displayName={unavailable ? intl.formatMessage(messages.unknownSubsectionLabel) : subsectionName}
            unavailable={unavailable}
            courseName={courseName}
            disabled={isDeletingGroupOrRuleBoxOrCriterion || isAssociating}
            onRemove={canEdit ? () => removeCriterion(criterion.id, 'group') : undefined}
          />
        );
      })}
    </div>
  );
};

export default CriterionChipList;
