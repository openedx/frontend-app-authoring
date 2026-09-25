import { useEffect, useRef } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Card } from '@openedx/paragon';
import classNames from 'classnames';
import { useCompetencyAssociations } from '../CompetencyAssociationsContext';
import type { BottomTierCompetencyCriteriaGroup } from '../data/types';
import LogicOperatorSelect from './LogicOperatorSelect';
import RuleBoxList from './RuleBoxList';
import messages from './messages';

export interface CriteriaGroupBoxProps {
  group: BottomTierCompetencyCriteriaGroup;
  subsectionNamesByUsageKey: Record<string, string>;
}

/** One bottom-tier group's "By completing any/all of the following"
 * bracket, plus its rule boxes. Scrolls itself into view when it's the
 * focused group but no rule box within it is focused - a focused rule box,
 * being the more specific/innermost target, scrolls itself instead (see
 * `RuleBox`), so exactly one of the two ever scrolls for a given focus.
 *
 * `Card` supplies the bordered/rounded box itself; the "By completing..."
 * band is a plain `<div>` with its own scoped styling
 * (`criteria-groups.scss`), since neither `Card.Header` (its own distinct
 * title/subtitle typography) nor any Paragon prop covers an inline-sentence
 * band like this one.
 */
const CriteriaGroupBox = ({ group, subsectionNamesByUsageKey }: CriteriaGroupBoxProps) => {
  const intl = useIntl();
  const { focus, focusGroup, index, systemDefaultProfile } = useCompetencyAssociations();
  const ref = useRef<HTMLDivElement>(null);

  const isFocused = focus?.groupId === group.id;
  // The rule key to hand down to this group's own `RuleBoxList` - `null`
  // whenever this group isn't the focused one at all, so a `RuleBox`
  // elsewhere in the tree (a different group) never matches it by accident.
  const focusedRuleKey = isFocused ? focus!.ruleKey : null;

  useEffect(() => {
    if (isFocused && focusedRuleKey === null) {
      ref.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [isFocused, focusedRuleKey]);

  const handleClick: React.MouseEventHandler = (event) => {
    event.stopPropagation();
    focusGroup(group.id);
  };

  const handleKeyDown: React.KeyboardEventHandler = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      event.stopPropagation();
      focusGroup(group.id);
    }
  };

  return (
    // The interactive/focus/scroll semantics live on this plain wrapping
    // `<div>`, not on `Card` itself - see `RuleBox.tsx`'s own identical
    // comment for why (`Card`'s `ref` forwarding doesn't reliably reach a
    // real DOM node).
    <div
      ref={ref}
      className={classNames('criteria-group-box', { 'criteria-group-box--focused': isFocused })}
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      <Card>
        <div className="criteria-group-box__header">
          {intl.formatMessage(messages.criteriaGroupBoxLabel, {
            operator: (
              <LogicOperatorSelect
                key="operator"
                className="criteria-group-box__header-operator"
                value={group.logicOperator}
                labels={{
                  and: intl.formatMessage(messages.logicOperatorAllLabel),
                  or: intl.formatMessage(messages.logicOperatorAnyLabel),
                }}
              />
            ),
          })}
        </div>
        {index && systemDefaultProfile && (
          <Card.Body className="criteria-group-box__rules">
            <RuleBoxList
              groupId={group.id}
              index={index}
              systemDefaultProfile={systemDefaultProfile}
              subsectionNamesByUsageKey={subsectionNamesByUsageKey}
            />
          </Card.Body>
        )}
      </Card>
    </div>
  );
};

export default CriteriaGroupBox;
