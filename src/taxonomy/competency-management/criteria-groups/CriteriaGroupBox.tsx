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
 * bracket, plus its rule boxes. The "By completing..." band is the group's
 * focus control; the rule boxes are siblings of it, not descendants, so no
 * interactive element contains another. Scrolls itself into view when it's the
 * focused group but no rule box within it is focused - a focused rule box,
 * being the more specific/innermost target, scrolls itself instead (see
 * `RuleBox`), so exactly one of the two ever scrolls for a given focus.
 *
 * `Card` supplies the bordered/rounded box itself; the "By completing..."
 * band is a `<div>` with its own scoped styling
 * (`criteria-groups.scss`), since neither `Card.Header` (its own distinct
 * title/subtitle typography) nor any Paragon prop covers an inline-sentence
 * band like this one.
 */
const CriteriaGroupBox = ({ group, subsectionNamesByUsageKey }: CriteriaGroupBoxProps) => {
  const intl = useIntl();
  const { focus, focusGroup, index, systemDefaultProfile } = useCompetencyAssociations();
  const ref = useRef<HTMLDivElement>(null);

  const isFocused = focus?.groupId === group.id;
  // `null` whenever this group isn't the focused one, so a `RuleBox` in a
  // different group never matches it by accident.
  const focusedRuleKey = isFocused ? focus!.ruleKey : null;

  useEffect(() => {
    if (isFocused && focusedRuleKey === null) {
      ref.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [isFocused, focusedRuleKey]);

  const handleClick: React.MouseEventHandler = () => {
    focusGroup(group.id);
  };

  const handleKeyDown: React.KeyboardEventHandler = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      focusGroup(group.id);
    }
  };

  return (
    // Focus/scroll state lives on this wrapping `<div>`, not `Card` itself:
    // `Card`'s `ref` forwarding doesn't reliably reach a real DOM node (see
    // `RuleBox.tsx`). It is not itself interactive, since the rule boxes it
    // contains are; the group's own control is the header band.
    <div
      ref={ref}
      className={classNames('criteria-group-box', { 'criteria-group-box--focused': isFocused })}
    >
      <Card>
        <div
          className="criteria-group-box__header"
          role="button"
          tabIndex={0}
          aria-pressed={isFocused}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
        >
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
