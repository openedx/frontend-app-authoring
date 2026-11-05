import { useEffect, useRef } from 'react';
import { Stack } from '@openedx/paragon';
import classNames from 'classnames';
import { useCompetencyAssociations } from '../CompetencyAssociationsContext';
import type { CompetencyCriterion, EffectiveRule } from '../data/types';
import CriterionChipList from './CriterionChipList';
import ScoreThresholdField from './ScoreThresholdField';

export interface RuleBoxProps {
  /** `groupId` and `ruleKey` together identify this box when matching it against the focus. */
  groupId: number;
  ruleKey: string;
  rule: EffectiveRule;
  criteria: CompetencyCriterion[];
  subsectionNamesByUsageKey: Record<string, string>;
}

/** One rule box: its score threshold, which focuses the box, and its criterion chips. */
const RuleBox = ({
  groupId,
  ruleKey,
  rule,
  criteria,
  subsectionNamesByUsageKey,
}: RuleBoxProps) => {
  const { focus, focusRuleBox } = useCompetencyAssociations();
  const isFocused = focus?.groupId === groupId && focus?.ruleKey === ruleKey;
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isFocused) {
      ref.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [isFocused]);

  return (
    <Stack
      ref={ref}
      gap={1.5}
      className={classNames('rule-box', { 'rule-box--focused': isFocused })}
    >
      <button
        type="button"
        className="rule-box__control"
        aria-current={isFocused}
        onClick={() => focusRuleBox(groupId, ruleKey)}
      >
        <ScoreThresholdField rulePayload={rule.rulePayload} />
      </button>
      <CriterionChipList criteria={criteria} subsectionNamesByUsageKey={subsectionNamesByUsageKey} />
    </Stack>
  );
};

export default RuleBox;
