import { useEffect, useRef } from 'react';
import type { ReactNode, RefObject } from 'react';
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
  getInlineValidationMessage?: (value: string) => string;
  /** Placeholder only: guidance under the score, such as "this score is taken". */
  hint?: ReactNode;
  /** Placeholder only: focus the score input on mount. */
  autoFocusSelect?: boolean;
  /** Placeholder only: what a duplicate rejection focuses. Defaults to the score input. */
  rejectionFocusRef?: RefObject<HTMLElement>;
}

/** One rule box: its score threshold, which focuses the box, and its criterion chips, or a hint when it is the placeholder. */
const RuleBox = ({
  groupId,
  ruleKey,
  rule,
  criteria,
  subsectionNamesByUsageKey,
  canEdit = false,
  getInlineValidationMessage,
  hint,
  autoFocusSelect = false,
  rejectionFocusRef,
}: RuleBoxProps) => {
  const intl = useIntl();
  const {
    focus,
    focusRuleBox,
    updateRuleScore,
    setPlaceholderRulePayload,
    placeholderDuplicateRejected,
    placeholderRejectionCount,
  } = useCompetencyAssociations();
  const isFocused = focus?.groupId === groupId && focus?.ruleKey === ruleKey;
  const isPlaceholder = ruleKey === null;
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isFocused) {
      ref.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [isFocused]);

  const isRejected = isPlaceholder && !!hint && placeholderDuplicateRejected;

  useEffect(() => {
    if (isRejected) {
      (rejectionFocusRef?.current ?? ref.current?.querySelector('input'))?.focus();
    }
    // The count changes on a repeat rejection, when the flag is already set.
  }, [isRejected, placeholderRejectionCount, rejectionFocusRef]);

  const handleScoreChange = (rulePayload: GradeRulePayload): Promise<void> => {
    // With no criteria yet, the score stays in the context until content is picked.
    if (isPlaceholder || groupId === null) {
      setPlaceholderRulePayload(rulePayload);
      return Promise.resolve();
    }
    return updateRuleScore(groupId, criteria.map((criterion) => criterion.id), rulePayload);
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
            {/* The score input is a control, so the select button is a sibling laid under it. */}
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
              autoFocusSelect={autoFocusSelect}
              hint={hint}
              hintIsError={isRejected}
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
