import { useEffect, useRef } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
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
    // Not itself interactive, since the rule boxes it contains are; the
    // group's own control is the header.
    <div
      ref={ref}
      className={classNames('criteria-group-box', { 'criteria-group-box--focused': isFocused })}
    >
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
        <div className="criteria-group-box__rules">
          <RuleBoxList
            groupId={group.id}
            index={index}
            systemDefaultProfile={systemDefaultProfile}
            subsectionNamesByUsageKey={subsectionNamesByUsageKey}
          />
        </div>
      )}
    </div>
  );
};

export default CriteriaGroupBox;
