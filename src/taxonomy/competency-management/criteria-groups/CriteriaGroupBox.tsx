import { useEffect, useRef } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import classNames from 'classnames';
import { useCompetencyAssociations } from '../CompetencyAssociationsContext';
import type { BottomTierCompetencyCriteriaGroup } from '../data/types';
import { ruleBoxesForGroup } from '../utils';
import LogicOperatorSelect from './LogicOperatorSelect';
import RuleBoxList from './RuleBoxList';
import messages from './messages';

export interface CriteriaGroupBoxProps {
  group: BottomTierCompetencyCriteriaGroup;
  subsectionNamesByUsageKey: Record<string, string>;
  /** Whether the author can edit this group's any/all logic and its rule boxes' scores. */
  canEdit: boolean;
}

/** One bottom-tier group's "By completing any/all of the following"
 * bracket, plus its rule boxes. The "By completing..." band focuses the
 * group; the rule boxes are its siblings, not descendants.
 *
 * At most one of the group and its rule boxes scrolls into view: a focused
 * rule box scrolls itself, and the group scrolls only when none of its boxes
 * matches the focused rule key.
 */
const CriteriaGroupBox = ({ group, subsectionNamesByUsageKey, canEdit }: CriteriaGroupBoxProps) => {
  const intl = useIntl();
  const {
    focus,
    focusGroup,
    status,
    groupsIndex,
    systemDefaultProfile,
    updateGroupOperator,
  } = useCompetencyAssociations();
  const ref = useRef<HTMLDivElement>(null);

  const isFocused = focus?.groupId === group.id;
  const boxes = status === 'success' ? ruleBoxesForGroup(group.id, groupsIndex, systemDefaultProfile) : [];
  const hasFocusedBox = isFocused && boxes.some((box) => box.key === focus.ruleKey);

  useEffect(() => {
    if (isFocused && !hasFocusedBox) {
      ref.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [isFocused, hasFocusedBox]);

  const sentence = intl.formatMessage(messages.criteriaGroupBoxLabel, {
    operator: (
      <LogicOperatorSelect
        key="operator"
        className="criteria-group-box__header-operator"
        value={group.logicOperator}
        labels={{
          and: intl.formatMessage(messages.logicOperatorAllLabel),
          or: intl.formatMessage(messages.logicOperatorAnyLabel),
        }}
        onChange={canEdit ? (logicOperator) => updateGroupOperator(group.id, logicOperator) : undefined}
      />
    ),
  });

  return (
    <div
      ref={ref}
      className={classNames('criteria-group-box', { 'criteria-group-box--focused': isFocused })}
    >
      {canEdit
        ? (
          // Not a `<button>`: it would nest the operator dropdown's own button.
          // Focus anywhere inside the header, including the dropdown toggle, focuses the group.
          <div
            className="criteria-group-box__header"
            aria-current={isFocused}
            onClick={() => focusGroup(group.id)}
            onFocus={() => focusGroup(group.id)}
          >
            {sentence}
          </div>
        )
        : (
          <button
            type="button"
            className="criteria-group-box__header"
            aria-current={isFocused}
            onClick={() => focusGroup(group.id)}
          >
            {sentence}
          </button>
        )}
      {status === 'success' && (
        <div className="criteria-group-box__rules">
          <RuleBoxList
            groupId={group.id}
            boxes={boxes}
            subsectionNamesByUsageKey={subsectionNamesByUsageKey}
            canEdit={canEdit}
          />
        </div>
      )}
    </div>
  );
};

export default CriteriaGroupBox;
