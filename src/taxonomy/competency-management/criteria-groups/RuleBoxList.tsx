import { useIntl } from '@edx/frontend-platform/i18n';
import { Stack } from '@openedx/paragon';
import { useCompetencyAssociations } from '../CompetencyAssociationsContext';
import type { EffectiveRule, RuleBox as RuleBoxData } from '../data/types';
import RuleBox from './RuleBox';
import messages from './messages';

export interface RuleBoxListProps {
  /** `null` for the placeholder group, which has no saved rule boxes. */
  groupId: number | null;
  boxes: RuleBoxData[];
  subsectionNamesByUsageKey: Record<string, string>;
  /** Whether the author can edit the boxes' score thresholds. */
  canEdit?: boolean;
}

/** Renders one `RuleBox` per box and gives each its duplicate-score validation, then the placeholder box if this group has one. */
const RuleBoxList = ({
  groupId,
  boxes,
  subsectionNamesByUsageKey,
  canEdit = false,
}: RuleBoxListProps) => {
  const intl = useIntl();
  const { focus, placeholder, systemDefaultProfile } = useCompetencyAssociations();

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

  // The placeholder box shows last in the focused group when its focus has no rule key. In the placeholder group
  // (`groupId === null`) it always shows, since that card renders only while the focus is on it.
  const placeholderRule: EffectiveRule | undefined = systemDefaultProfile && {
    ruleType: systemDefaultProfile.ruleType,
    rulePayload: placeholder.rulePayload ?? systemDefaultProfile.rulePayload,
  };
  const showPlaceholder = !!placeholderRule && focus?.groupId === groupId && focus.ruleKey === null;

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
      {showPlaceholder && (
        <RuleBox
          key="placeholder"
          groupId={groupId}
          ruleKey={null}
          rule={placeholderRule}
          criteria={[]}
          subsectionNamesByUsageKey={subsectionNamesByUsageKey}
          canEdit={canEdit}
          getInlineValidationMessage={getInlineValidationMessage({
            key: '__placeholder__',
            rule: placeholderRule,
            criteria: [],
          })}
        />
      )}
    </Stack>
  );
};

export default RuleBoxList;
