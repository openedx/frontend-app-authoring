import { useIntl } from '@edx/frontend-platform/i18n';
import { Stack } from '@openedx/paragon';
import { useCompetencyAssociations } from '../CompetencyAssociationsContext';
import type { EffectiveRule, GradeRulePayload, RuleBox as RuleBoxData } from '../data/types';
import { isRuleTakenInGroup, nextUnusedScore } from '../utils';
import RuleBox from './RuleBox';
import { formatScoreSummary } from './formatScoreSummary';
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
  const {
    focus,
    placeholder,
    systemDefaultProfile,
    setPlaceholderRulePayload,
  } = useCompetencyAssociations();

  const getInlineValidationMessage = (candidateBox: RuleBoxData) => (candidatePayload: GradeRulePayload): string => {
    const candidate: EffectiveRule = { ruleType: candidateBox.rule.ruleType, rulePayload: candidatePayload };
    return isRuleTakenInGroup(candidate, boxes, candidateBox.key)
      ? intl.formatMessage(messages.duplicateScoreValidationMessage)
      : '';
  };

  // The placeholder box shows last in the focused group when its focus has no rule key. In the placeholder group
  // (`groupId === null`) it always shows, since that card renders only while the focus is on it.
  const placeholderRule: EffectiveRule | undefined = systemDefaultProfile && {
    ruleType: systemDefaultProfile.ruleType,
    rulePayload: placeholder.rulePayload ?? systemDefaultProfile.rulePayload,
  };
  const showPlaceholder = !!placeholderRule && focus?.groupId === groupId && focus.ruleKey === null;

  // An untouched default that another box already uses would merge into that box on save.
  const isPlaceholderScoreTaken = canEdit && !!placeholderRule && isRuleTakenInGroup(placeholderRule, boxes);
  const suggestedScore = isPlaceholderScoreTaken ? nextUnusedScore(placeholderRule, boxes) : null;
  const placeholderScoreTakenHint = isPlaceholderScoreTaken
    ? intl.formatMessage(messages.defaultScoreTakenHint, {
      score: formatScoreSummary(intl, placeholderRule.rulePayload),
    })
    : undefined;
  const placeholderScoreSuggestion = suggestedScore
    ? {
      rulePayload: suggestedScore,
      onApply: () => setPlaceholderRulePayload(suggestedScore),
    }
    : undefined;

  return (
    <Stack gap={2} className="rule-box-list">
      {boxes.map((box) => (
        <RuleBox
          key={String(Math.min(...box.criteria.map((criterion) => criterion.id)))}
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
          scoreTakenHint={placeholderScoreTakenHint}
          scoreSuggestion={placeholderScoreSuggestion}
          autoOpen={placeholder.justAdded && isPlaceholderScoreTaken}
          focusButtonOnMount={placeholder.justAdded && !isPlaceholderScoreTaken}
        />
      )}
    </Stack>
  );
};

export default RuleBoxList;
