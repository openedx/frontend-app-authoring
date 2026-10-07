import { useEffect, useRef } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Button, Stack } from '@openedx/paragon';
import { useCompetencyAssociations } from '../CompetencyAssociationsContext';
import type { EffectiveRule, RuleBox as RuleBoxData } from '../data/types';
import { isRuleTakenInGroup, nextUnusedScore } from '../utils';
import RuleBox from './RuleBox';
import { formatScoreSummary } from './ScoreThresholdField';
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
  // The score field remounts on every score change; only "Add Rule" and the suggestion link may move focus.
  const refocusAfterSuggestion = useRef(false);
  useEffect(() => {
    refocusAfterSuggestion.current = false;
  });

  const getInlineValidationMessage = (candidateBox: RuleBoxData) => (value: string): string => {
    const candidate: EffectiveRule = {
      ruleType: candidateBox.rule.ruleType,
      rulePayload: { ...candidateBox.rule.rulePayload, value: Math.round(Number(value)) / 100 },
    };
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
  const placeholderHint = isPlaceholderScoreTaken && (
    <>
      {intl.formatMessage(messages.defaultScoreTakenHint, {
        score: formatScoreSummary(intl, placeholderRule.rulePayload),
      })}
      {suggestedScore && (
        <>
          {' '}
          <Button
            variant="link"
            size="inline"
            className="rule-box__use-suggestion"
            onClick={() => {
              refocusAfterSuggestion.current = true;
              setPlaceholderRulePayload(suggestedScore);
            }}
          >
            {intl.formatMessage(messages.useSuggestedScoreLink, { score: formatScoreSummary(intl, suggestedScore) })}
          </Button>
        </>
      )}
    </>
  );

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
          // Remounts when the displayed score changes, since the field never resyncs from props.
          key={`placeholder-${Math.round(placeholderRule.rulePayload.value * 100)}`}
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
          hint={placeholderHint || undefined}
          autoFocusSelect={groupId !== null && (placeholder.rulePayload === null || refocusAfterSuggestion.current)}
        />
      )}
    </Stack>
  );
};

export default RuleBoxList;
