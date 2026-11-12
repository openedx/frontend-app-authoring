import { useEffect, useState } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Stack } from '@openedx/paragon';
import { useCompetencyAssociations } from '../CompetencyAssociationsContext';
import type { EffectiveRule, GradeRulePayload, RuleBox as RuleBoxData } from '../data/types';
import { isRuleTakenInGroup, nextUnusedScore, ruleKeyOf } from '../utils';
import RuleBox from './RuleBox';
import { formatScoreSummary } from './ScoreThresholdField';
import messages from './messages';

const placeholderKeyOf = (rulePayload: GradeRulePayload) => `placeholder-${Math.round(rulePayload.value * 100)}`;

/** What a box does once it mounts under `key`, after a score change remounted it. */
interface AfterRemount {
  key: string;
  action: 'open' | 'focusPill';
}

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
  // A box remounts on every score change (see the keys below), so a request that must survive the remount waits
  // here until the box under `key` mounts and consumes it.
  const [afterRemount, setAfterRemount] = useState<AfterRemount | null>(null);

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

  const placeholderKey = placeholderRule && placeholderKeyOf(placeholderRule.rulePayload);
  const renderedKeys = [...boxes.map((box) => box.key), ...(showPlaceholder && placeholderKey ? [placeholderKey] : [])];
  // Cleared once the awaited box has mounted, which is after its mount effects have run.
  useEffect(() => {
    if (afterRemount && renderedKeys.includes(afterRemount.key)) {
      setAfterRemount(null);
    }
  });

  const isAwaited = (key: string | undefined, action: AfterRemount['action']) => (
    afterRemount !== null && afterRemount.key === key && afterRemount.action === action
  );

  const requestPillFocusAfterSave = (box: RuleBoxData) => (rulePayload: GradeRulePayload, save: Promise<void>) => {
    if (!systemDefaultProfile) {
      return;
    }
    const newKey = ruleKeyOf(
      { ruleTypeOverride: box.rule.ruleType, rulePayloadOverride: rulePayload },
      systemDefaultProfile,
    );
    setAfterRemount({ key: newKey, action: 'focusPill' });
    save.catch(() => setAfterRemount(null));
  };

  // An untouched default that another box already uses would merge into that box on save.
  const isPlaceholderScoreTaken = canEdit && !!placeholderRule && isRuleTakenInGroup(placeholderRule, boxes);
  const suggestedScore = isPlaceholderScoreTaken ? nextUnusedScore(placeholderRule, boxes) : null;
  const placeholderHint = isPlaceholderScoreTaken
    ? intl.formatMessage(messages.defaultScoreTakenHint, {
      score: formatScoreSummary(intl, placeholderRule.rulePayload),
    })
    : undefined;
  const placeholderSuggestion = suggestedScore
    ? {
      rulePayload: suggestedScore,
      onApply: () => {
        setAfterRemount({ key: placeholderKeyOf(suggestedScore), action: 'open' });
        setPlaceholderRulePayload(suggestedScore);
      },
    }
    : undefined;

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
          focusPillOnMount={isAwaited(box.key, 'focusPill')}
          onScoreSave={requestPillFocusAfterSave(box)}
        />
      ))}
      {showPlaceholder && (
        <RuleBox
          // Remounts when the displayed score changes, since the field never resyncs from props.
          key={placeholderKey}
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
          hint={placeholderHint}
          suggestion={placeholderSuggestion}
          autoOpen={placeholder.opensScoreSettings || isAwaited(placeholderKey, 'open')}
          focusPillOnMount={isAwaited(placeholderKey, 'focusPill')}
          onScoreSave={(rulePayload, save) => {
            setAfterRemount({ key: placeholderKeyOf(rulePayload), action: 'focusPill' });
            save.catch(() => setAfterRemount(null));
          }}
        />
      )}
    </Stack>
  );
};

export default RuleBoxList;
