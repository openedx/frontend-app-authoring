import { Stack } from '@openedx/paragon';
import type { RuleBox as RuleBoxData } from '../data/types';
import RuleBox from './RuleBox';

export interface RuleBoxListProps {
  groupId: number;
  boxes: RuleBoxData[];
  subsectionNamesByUsageKey: Record<string, string>;
}

/** Renders one `RuleBox` per rule box of a bottom-tier group. */
const RuleBoxList = ({
  groupId,
  boxes,
  subsectionNamesByUsageKey,
}: RuleBoxListProps) => (
  <Stack gap={2} className="rule-box-list">
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
  </Stack>
);

export default RuleBoxList;
