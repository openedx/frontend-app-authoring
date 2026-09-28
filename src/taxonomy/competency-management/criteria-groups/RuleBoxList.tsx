import type { CompetencyCriteriaGroupsIndex } from '../utils';
import { ruleBoxesForGroup } from '../utils';
import type { CompetencyRuleProfile } from '../data/types';
import RuleBox from './RuleBox';

export interface RuleBoxListProps {
  groupId: number;
  index: CompetencyCriteriaGroupsIndex;
  systemDefaultProfile: CompetencyRuleProfile;
  subsectionNamesByUsageKey: Record<string, string>;
}

/** Derives one bottom-tier group's rule boxes via `ruleBoxesForGroup` and
 * renders one `RuleBox` per box. Each `RuleBox` reads its own focus state
 * from `CompetencyAssociationsContext` directly (given `groupId` and its
 * own box key to compare against), so no focus state is threaded through
 * here.
 */
const RuleBoxList = ({
  groupId,
  index,
  systemDefaultProfile,
  subsectionNamesByUsageKey,
}: RuleBoxListProps) => {
  const boxes = ruleBoxesForGroup(groupId, index, systemDefaultProfile);

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
        />
      ))}
    </div>
  );
};

export default RuleBoxList;
