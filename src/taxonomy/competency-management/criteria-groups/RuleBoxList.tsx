import { useIntl } from '@edx/frontend-platform/i18n';
import type { CompetencyCriteriaGroupsIndex } from '../utils';
import { ruleBoxesForGroup } from '../utils';
import type { CompetencyRuleProfile, RuleBox as RuleBoxData } from '../data/types';
import RuleBox from './RuleBox';
import messages from './messages';

export interface RuleBoxListProps {
  groupId: number;
  index: CompetencyCriteriaGroupsIndex;
  systemDefaultProfile: CompetencyRuleProfile;
  subsectionNamesByUsageKey: Record<string, string>;
  /** Threaded down from `CriteriaGroupBox` (originally resolved by
   * `CourseGroupSection` via `canEditCourse`) - see `CriteriaGroupBoxProps.canEdit`.
   * Optional, defaulting to `false`, so every caller that predates this prop
   * keeps working unchanged.
   */
  canEdit?: boolean;
}

/** Derives one bottom-tier group's rule boxes via `ruleBoxesForGroup` and
 * renders one `RuleBox` per box. Each `RuleBox` reads its own focus state
 * from `CompetencyAssociationsContext` directly (given `groupId` and its
 * own box key to compare against), so no focus state is threaded through
 * here.
 *
 * Also builds each box's own `getInlineValidationMessage` (the
 * duplicate-score check) here, using `boxes`/`index`/`systemDefaultProfile`,
 * which this component already has - `RuleBox` takes no new data dependency
 * for it.
 */
const RuleBoxList = ({
  groupId,
  index,
  systemDefaultProfile,
  subsectionNamesByUsageKey,
  canEdit = false,
}: RuleBoxListProps) => {
  const intl = useIntl();
  const boxes = ruleBoxesForGroup(groupId, index, systemDefaultProfile);

  // Compares rounded percent + rule type + op, not `ruleKeyOf`'s raw string
  // key (built from a raw fraction, which risks a formatting mismatch that
  // silently never fires). Excludes the box being edited by its own `key`.
  const getInlineValidationMessage = (candidateBox: RuleBoxData) => (value: string): string => {
    const candidatePercent = Math.round(Number(value));
    const isDuplicate = boxes.some((other) => (
      other.key !== candidateBox.key
      && other.rule.ruleType === candidateBox.rule.ruleType
      && other.rule.rulePayload.op === candidateBox.rule.rulePayload.op
      && Math.round(other.rule.rulePayload.value * 100) === candidatePercent
    ));
    return isDuplicate ? intl.formatMessage(messages.duplicateScoreValidationMessage) : '';
  };

  return (
    <div className="rule-box-list">
      {boxes.map((box) => (
        <RuleBox
          key={box.key}
          groupId={groupId}
          ruleKey={box.key}
          rule={box.rule}
          criteria={box.criteria}
          subsectionNamesByUsageKey={subsectionNamesByUsageKey}
          canEdit={canEdit}
          getInlineValidationMessage={getInlineValidationMessage(box)}
        />
      ))}
    </div>
  );
};

export default RuleBoxList;
