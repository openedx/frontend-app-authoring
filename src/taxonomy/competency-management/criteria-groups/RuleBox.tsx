import { useEffect, useRef } from 'react';
import { Card } from '@openedx/paragon';
import classNames from 'classnames';
import { useCompetencyAssociations } from '../CompetencyAssociationsContext';
import type { CompetencyCriterion, EffectiveRule, GradeRulePayload } from '../data/types';
import CriterionChipList from './CriterionChipList';
import ScoreThresholdField from './ScoreThresholdField';

export interface RuleBoxProps {
  /** The group this box belongs to, and this box's own rule key - together
   * this box's identity for focus comparisons against
   * `CompetencyAssociationsContext`'s `focus`.
   */
  groupId: number;
  ruleKey: string;
  /** The rule this box displays, given as a prop rather than read from a
   * criterion - so this same component will later serve a not-yet-saved
   * box (a later ticket's concern) that has no criterion of its own yet.
   */
  rule: EffectiveRule;
  criteria: CompetencyCriterion[];
  subsectionNamesByUsageKey: Record<string, string>;
  /** Threaded down from `RuleBoxList` (originally resolved by
   * `CourseGroupSection` via `canEditCourse`) - see `CriteriaGroupBoxProps.canEdit`.
   * Optional, defaulting to `false`, so every caller that predates this prop
   * keeps working unchanged.
   */
  canEdit?: boolean;
  /** Built once by `RuleBoxList` for this specific box (the duplicate-score
   * check) - passed straight through to `ScoreThresholdField`. Only
   * meaningful when `canEdit` is true.
   */
  getInlineValidationMessage?: (value: string) => string;
}

/** One rule box: the rule it's given, its chips, and focus/click behavior.
 * Scrolls itself into view (`block: 'nearest'`) when it becomes the focused
 * box - the innermost focused element, so its containing `CriteriaGroupBox`
 * does not also scroll itself in that case.
 */
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

  const handleClick: React.MouseEventHandler = (event) => {
    // Stops the click from also bubbling into the containing
    // `CriteriaGroupBox`'s own click handler, which would otherwise
    // overwrite this box's more specific focus with the group's broader one.
    event.stopPropagation();
    focusRuleBox(groupId, ruleKey);
  };

  const handleKeyDown: React.KeyboardEventHandler = (event) => {
    // Only this wrapper's own key events, not ones bubbled up from the
    // score input once `canEdit` is true - otherwise this handler's
    // `preventDefault` would swallow the input's own Enter/Escape.
    if (event.target !== event.currentTarget) {
      return;
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      event.stopPropagation();
      focusRuleBox(groupId, ruleKey);
    }
  };

  const handleScoreChange = (rulePayload: GradeRulePayload): Promise<void> => (
    updateRuleScore(groupId, criteria.map((criterion) => criterion.id), rulePayload)
  );

  return (
    // The interactive/focus/scroll semantics live on this plain wrapping
    // `<div>`, not on `Card` itself: `Card`'s own `ref` forwarding doesn't
    // reliably reach a real DOM node (confirmed directly - `ref.current`
    // ends up with no `scrollIntoView`), so `Card` here is purely the
    // visual bordered box.
    <div
      ref={ref}
      className={classNames('rule-box', { 'rule-box--focused': isFocused })}
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      <Card>
        <Card.Body className="rule-box__body">
          <ScoreThresholdField
            rulePayload={rule.rulePayload}
            onChange={canEdit ? handleScoreChange : undefined}
            getInlineValidationMessage={canEdit ? getInlineValidationMessage : undefined}
          />
          <CriterionChipList criteria={criteria} subsectionNamesByUsageKey={subsectionNamesByUsageKey} />
        </Card.Body>
      </Card>
    </div>
  );
};

export default RuleBox;
