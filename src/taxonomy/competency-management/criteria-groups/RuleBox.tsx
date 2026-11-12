import { useEffect, useRef } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Stack } from '@openedx/paragon';
import classNames from 'classnames';
import { useCompetencyAssociations } from '../CompetencyAssociationsContext';
import type { CompetencyCriterion, EffectiveRule, GradeRulePayload } from '../data/types';
import CriterionChipList from './CriterionChipList';
import ScoreThresholdField from './ScoreThresholdField';
import messages from './messages';

export interface RuleBoxProps {
  /** `null` only for the placeholder rule box in the placeholder group. */
  groupId: number | null;
  /** `null` renders the not-yet-saved placeholder box: a hint instead of chips, and a score kept in the context. */
  ruleKey: string | null;
  rule: EffectiveRule;
  criteria: CompetencyCriterion[];
  subsectionNamesByUsageKey: Record<string, string>;
  /** Whether the author can edit the score threshold. */
  canEdit?: boolean;
  /** Duplicate-score check for this box, used only when `canEdit`. */
  getInlineValidationMessage?: (candidate: GradeRulePayload) => string;
  /** Placeholder only: guidance under the score, such as "this score is taken". */
  hint?: string;
  /** Placeholder only: a "Use {score}" link in the score popover, for a taken score. */
  suggestion?: { rulePayload: GradeRulePayload; onApply: () => void; };
  /** Placeholder only: open the score popover on mount. */
  autoOpen?: boolean;
  /** Focus the score pill on mount, for a box that remounted because its score changed. */
  focusPillOnMount?: boolean;
  /** Called with the payload and the pending save as soon as the popover commits a score, before the save
   * settles, so the owner can prepare for the remount a changed score causes.
   */
  onScoreSave?: (rulePayload: GradeRulePayload, save: Promise<void>) => void;
}

/** One rule box: its score threshold, whose pill opens the box's settings popover, and its criterion chips, or a hint when it is the placeholder. */
const RuleBox = ({
  groupId,
  ruleKey,
  rule,
  criteria,
  subsectionNamesByUsageKey,
  canEdit = false,
  getInlineValidationMessage,
  hint,
  suggestion,
  autoOpen = false,
  focusPillOnMount = false,
  onScoreSave,
}: RuleBoxProps) => {
  const intl = useIntl();
  const {
    focus,
    focusRuleBox,
    updateRuleScore,
    setPlaceholderRulePayload,
    placeholderDuplicateRejected,
    placeholderDuplicateRejectionCount,
  } = useCompetencyAssociations();
  const isFocused = focus?.groupId === groupId && focus?.ruleKey === ruleKey;
  const isPlaceholder = ruleKey === null;
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isFocused) {
      ref.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [isFocused]);

  const isDuplicateRejected = isPlaceholder && !!hint && placeholderDuplicateRejected;

  const handleScoreChange = (rulePayload: GradeRulePayload): Promise<void> => {
    // With no criteria yet, the score stays in the context until content is picked.
    let save: Promise<void>;
    if (isPlaceholder || groupId === null) {
      setPlaceholderRulePayload(rulePayload);
      save = Promise.resolve();
    } else {
      save = updateRuleScore(groupId, criteria.map((criterion) => criterion.id), rulePayload);
    }
    onScoreSave?.(rulePayload, save);
    return save;
  };

  const selectRuleBox = () => {
    if (groupId !== null && ruleKey !== null) {
      focusRuleBox(groupId, ruleKey);
    }
  };

  return (
    <Stack
      ref={ref}
      gap={1.5}
      className={classNames('rule-box position-relative', { 'rule-box--focused': isFocused })}
    >
      {canEdit
        ? (
          <>
            {/* The score pill is a control, so the select button is a sibling laid under it. */}
            {!isPlaceholder && (
              <button
                type="button"
                className="rule-box__select-button"
                aria-current={isFocused}
                onClick={selectRuleBox}
              >
                <span className="sr-only">{intl.formatMessage(messages.selectRuleBoxButtonLabel)}</span>
              </button>
            )}
            <ScoreThresholdField
              rulePayload={rule.rulePayload}
              onChange={handleScoreChange}
              getInlineValidationMessage={getInlineValidationMessage}
              autoOpen={autoOpen}
              focusPillOnMount={focusPillOnMount}
              hint={hint}
              hintIsError={isDuplicateRejected}
              rejectionCount={placeholderDuplicateRejectionCount}
              suggestion={suggestion}
            />
          </>
        )
        : (
          <button
            type="button"
            className="rule-box__control stretched-link"
            aria-current={isFocused}
            onClick={selectRuleBox}
          >
            <ScoreThresholdField rulePayload={rule.rulePayload} />
          </button>
        )}
      {isPlaceholder
        ? (
          <div className="rule-box__placeholder-hint text-muted">
            {intl.formatMessage(messages.placeholderRuleBoxHint)}
          </div>
        )
        : <CriterionChipList criteria={criteria} subsectionNamesByUsageKey={subsectionNamesByUsageKey} />}
    </Stack>
  );
};

export default RuleBox;
