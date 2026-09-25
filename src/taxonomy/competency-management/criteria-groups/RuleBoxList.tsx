import { useIntl } from '@edx/frontend-platform/i18n';
import { Stack } from '@openedx/paragon';
import type { RuleBox as RuleBoxData } from '../data/types';
import RuleBox from './RuleBox';
import messages from './messages';

export interface RuleBoxListProps {
  groupId: number;
  boxes: RuleBoxData[];
  subsectionNamesByUsageKey: Record<string, string>;
  /** Whether the author can edit the boxes' score thresholds. */
  canEdit?: boolean;
}

/** Renders one `RuleBox` per box and gives each its duplicate-score validation. */
const RuleBoxList = ({
  groupId,
  boxes,
  subsectionNamesByUsageKey,
  canEdit = false,
}: RuleBoxListProps) => {
  const intl = useIntl();

  // Compares the rounded percent, not `ruleKeyOf`'s raw-fraction key, whose formatting could silently never match.
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
    <Stack gap={2} className="rule-box-list">
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
    </Stack>
  );
};

export default RuleBoxList;
