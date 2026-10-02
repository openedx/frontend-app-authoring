import { useEffect, useRef } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import classNames from 'classnames';
import { useCompetencyAssociations } from '../CompetencyAssociationsContext';
import type { BottomTierCompetencyCriteriaGroup } from '../data/types';
import { ruleBoxesForGroup } from '../utils';
import AddControl from './AddControl';
import LogicOperatorSelect from './LogicOperatorSelect';
import RuleBoxList from './RuleBoxList';
import messages from './messages';

export interface CriteriaGroupBoxProps {
  /** `undefined` for the not-yet-saved placeholder group, which reads its any/all logic from the context. */
  group?: BottomTierCompetencyCriteriaGroup;
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
    placeholder,
    focusGroup,
    status,
    groupsIndex,
    systemDefaultProfile,
    updateGroupOperator,
    addPlaceholderRuleBox,
    setPlaceholderLogicOperator,
    hasPlaceholder,
  } = useCompetencyAssociations();
  const ref = useRef<HTMLDivElement>(null);

  // `null` is the placeholder group's id in `CriteriaFocus`.
  const groupId = group?.id ?? null;
  const logicOperator = group ? group.logicOperator : placeholder.logicOperator;
  const isFocused = focus?.groupId === groupId;
  const boxes = status === 'success' && groupId !== null
    ? ruleBoxesForGroup(groupId, groupsIndex, systemDefaultProfile)
    : [];
  // A placeholder rule box (`ruleKey === null`) scrolls itself.
  const hasFocusedBox = isFocused && (focus.ruleKey === null || boxes.some((box) => box.key === focus.ruleKey));

  useEffect(() => {
    if (isFocused && !hasFocusedBox) {
      ref.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [isFocused, hasFocusedBox]);

  const sentenceLabel = intl.formatMessage(messages.criteriaGroupBoxLabel, {
    operator: logicOperator === 'AND'
      ? intl.formatMessage(messages.logicOperatorAllLabel)
      : intl.formatMessage(messages.logicOperatorAnyLabel),
  });
  const sentence = intl.formatMessage(messages.criteriaGroupBoxLabel, {
    operator: (
      <LogicOperatorSelect
        key="operator"
        className="criteria-group-box__header-operator"
        value={logicOperator}
        labels={{
          and: intl.formatMessage(messages.logicOperatorAllLabel),
          or: intl.formatMessage(messages.logicOperatorAnyLabel),
        }}
        onChange={canEdit
          ? (newLogicOperator) => (
            group ? updateGroupOperator(group.id, newLogicOperator) : setPlaceholderLogicOperator(newLogicOperator)
          )
          : undefined}
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
          // The operator dropdown is a button, so the select control is a sibling laid over the band.
          <div className="criteria-group-box__header">
            {group && (
              <button
                type="button"
                className="criteria-group-box__select-button"
                aria-current={isFocused}
                onClick={() => focusGroup(group.id)}
              >
                <span className="sr-only">{sentenceLabel}</span>
              </button>
            )}
            {sentence}
          </div>
        )
        : (
          <button
            type="button"
            className="criteria-group-box__header"
            aria-current={isFocused}
            onClick={() => group && focusGroup(group.id)}
          >
            {sentence}
          </button>
        )}
      {status === 'success' && (
        <div className="criteria-group-box__rules">
          <RuleBoxList
            groupId={groupId}
            boxes={boxes}
            subsectionNamesByUsageKey={subsectionNamesByUsageKey}
            canEdit={canEdit}
          />
          {canEdit && groupId !== null && (
            <AddControl
              label={intl.formatMessage(messages.addRuleButtonLabel)}
              disabled={hasPlaceholder}
              onClick={() => addPlaceholderRuleBox(groupId)}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default CriteriaGroupBox;
