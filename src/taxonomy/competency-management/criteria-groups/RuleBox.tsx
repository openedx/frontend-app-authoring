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
  /** Name of the course these criteria belong to, read aloud for an unavailable chip. */
  courseName?: string;
  /** Whether the author can edit the score threshold. */
  canEdit?: boolean;
  /** Duplicate-score check for this box, used only when `canEdit`. */
  getInlineValidationMessage?: (candidate: GradeRulePayload) => string;
  /** Placeholder only: shown in the score settings popover when another box in the group already uses this score. */
  scoreTakenHint?: string;
  /** Placeholder only: a "Use {score}" link in the score settings popover, for a taken score. */
  scoreSuggestion?: { rulePayload: GradeRulePayload; onApply: () => void; };
  /** Placeholder only: open the score popover on mount. */
  autoOpen?: boolean;
  /** Placeholder only: focus the score settings button once, when the box mounts. */
  focusButtonOnMount?: boolean;
}

/**
 * One rule box: its score threshold, whose score settings button opens the box's settings popover, and its
 * criterion chips, or a hint when it is the placeholder.
 */
const RuleBox = ({
  groupId,
  ruleKey,
  rule,
  criteria,
  subsectionNamesByUsageKey,
  courseName,
  canEdit = false,
  getInlineValidationMessage,
  scoreTakenHint,
  scoreSuggestion,
  autoOpen = false,
  focusButtonOnMount = false,
}: RuleBoxProps) => {
  const intl = useIntl();
  const {
    selection,
    selectRuleBox,
    updateRuleScore,
    setPlaceholderRulePayload,
    placeholderDuplicateRejected,
    placeholderDuplicateRejectionCount,
  } = useCompetencyAssociations();
  const isSelected = selection?.groupId === groupId && selection?.ruleKey === ruleKey;
  const isPlaceholder = ruleKey === null;
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isSelected) {
      ref.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [isSelected]);

  const isDuplicateRejected = isPlaceholder && !!scoreTakenHint && placeholderDuplicateRejected;

  const handleScoreChange = (rulePayload: GradeRulePayload): Promise<void> => {
    // With no criteria yet, the score stays in the context until content is picked.
    if (isPlaceholder || groupId === null) {
      setPlaceholderRulePayload(rulePayload);
      return Promise.resolve();
    }
    return updateRuleScore(groupId, criteria.map((criterion) => criterion.id), rulePayload);
  };

  const handleSelectClick = () => {
    if (groupId !== null && ruleKey !== null) {
      selectRuleBox(groupId, ruleKey);
    }
  };

  return (
    <Stack
      ref={ref}
      gap={1.5}
      className={classNames('rule-box position-relative', { 'rule-box--selected': isSelected })}
    >
      {canEdit
        ? (
          <>
            {/* The score settings button is a control, so the select button is a sibling laid under it. */}
            {!isPlaceholder && (
              <button
                type="button"
                className="rule-box__select-button"
                aria-current={isSelected}
                onClick={handleSelectClick}
              >
                <span className="sr-only">{intl.formatMessage(messages.selectRuleBoxButtonLabel)}</span>
              </button>
            )}
            <ScoreThresholdField
              rulePayload={rule.rulePayload}
              onChange={handleScoreChange}
              getInlineValidationMessage={getInlineValidationMessage}
              autoOpen={autoOpen}
              focusButtonOnMount={focusButtonOnMount}
              scoreTakenHint={scoreTakenHint}
              hintIsError={isDuplicateRejected}
              rejectionCount={placeholderDuplicateRejectionCount}
              scoreSuggestion={scoreSuggestion}
            />
          </>
        )
        : (
          <button
            type="button"
            className="rule-box__control stretched-link"
            aria-current={isSelected}
            onClick={handleSelectClick}
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
        : (
          <CriterionChipList
            criteria={criteria}
            subsectionNamesByUsageKey={subsectionNamesByUsageKey}
            courseName={courseName}
            canEdit={canEdit}
          />
        )}
    </Stack>
  );
};

export default RuleBox;
