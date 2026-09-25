import { useEffect, useRef } from 'react';
import { Stack } from '@openedx/paragon';
import classNames from 'classnames';
import { useCompetencyAssociations } from '../CompetencyAssociationsContext';
import type { CompetencyCriterion, EffectiveRule, GradeRulePayload } from '../data/types';
import CriterionChipList from './CriterionChipList';
import ScoreThresholdField from './ScoreThresholdField';

export interface RuleBoxProps {
  groupId: number;
  ruleKey: string;
  rule: EffectiveRule;
  criteria: CompetencyCriterion[];
  subsectionNamesByUsageKey: Record<string, string>;
  /** Whether the author can edit the score threshold. */
  canEdit?: boolean;
  /** Duplicate-score check for this box, used only when `canEdit`. */
  getInlineValidationMessage?: (value: string) => string;
}

/** One rule box: its score threshold, which focuses the box, and its criterion chips. */
const RuleBox = ({
  groupId,
  ruleKey,
  rule,
  criteria,
  subsectionNamesByUsageKey,
  canEdit = false,
  getInlineValidationMessage,
}: RuleBoxProps) => {
  const { focus, focusRuleBox, updateRuleScore } = useCompetencyAssociations();
  const isFocused = focus?.groupId === groupId && focus?.ruleKey === ruleKey;
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isFocused) {
      ref.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [isFocused]);

  const handleScoreChange = (rulePayload: GradeRulePayload): Promise<void> => (
    updateRuleScore(groupId, criteria.map((criterion) => criterion.id), rulePayload)
  );

  return (
    <Stack
      ref={ref}
      gap={1.5}
      className={classNames('rule-box position-relative', { 'rule-box--focused': isFocused })}
    >
      {canEdit
        ? (
          // Not a `<button>`: it would nest the score input. Focus anywhere inside the box focuses it.
          <div
            className="rule-box__control"
            aria-current={isFocused}
            onClick={() => focusRuleBox(groupId, ruleKey)}
            onFocus={() => focusRuleBox(groupId, ruleKey)}
          >
            <ScoreThresholdField
              rulePayload={rule.rulePayload}
              onChange={handleScoreChange}
              getInlineValidationMessage={getInlineValidationMessage}
            />
          </div>
        )
        : (
          <button
            type="button"
            className="rule-box__control stretched-link"
            aria-current={isFocused}
            onClick={() => focusRuleBox(groupId, ruleKey)}
          >
            <ScoreThresholdField rulePayload={rule.rulePayload} />
          </button>
        )}
      <CriterionChipList criteria={criteria} subsectionNamesByUsageKey={subsectionNamesByUsageKey} />
    </Stack>
  );
};

export default RuleBox;
