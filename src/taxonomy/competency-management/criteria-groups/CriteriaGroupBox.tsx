import { useEffect, useRef } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import classNames from 'classnames';
import { useCompetencyAssociations } from '../CompetencyAssociationsContext';
import type { BottomTierCompetencyCriteriaGroup } from '../data/types';
import { ruleBoxesForGroup } from '../utils';
import { RemovalTargetKind } from '@src/taxonomy/competency-management/constants';
import AddControl from './AddControl';
import type { AddControlProps } from './AddControl';
import LogicOperatorSelect from './LogicOperatorSelect';
import MoreActionsMenu from './MoreActionsMenu';
import RuleBoxList from './RuleBoxList';
import messages from './messages';

const isInputOrEditableElement = (element: Element | null): boolean => (
  element instanceof HTMLInputElement
  || element instanceof HTMLTextAreaElement
  || element instanceof HTMLSelectElement
  || (element instanceof HTMLElement && element.isContentEditable)
);

export interface CriteriaGroupBoxProps {
  /** `undefined` for the not-yet-saved placeholder group, which reads its any/all logic from the context. */
  group?: BottomTierCompetencyCriteriaGroup;
  subsectionNamesByUsageKey: Record<string, string>;
  /** Whether the author can edit this group's any/all logic and its rule boxes' scores, and whether the ⋮ menus
   * show.
   */
  canEdit: boolean;
  /** The 1-based position of `group` among its course group's rule groups, which names its menu and its rule boxes'
   * menus. Unused for the placeholder.
   */
  position: number;
  /** The course the group belongs to, which names its menu and its rule boxes' menus. */
  courseName: string;
}

/** One bottom-tier group's "By completing any/all of the following"
 * bracket, plus its rule boxes. The "By completing..." band selects the
 * group; the rule boxes are its siblings, not descendants.
 *
 * A selected rule box scrolls itself into view; the group scrolls only when
 * it is selected and none of its rule boxes is. A saved group with no criteria
 * has no rule key to match, so it is selected as its placeholder rule box by
 * design, and that box scrolls.
 */
const CriteriaGroupBox = (
  { group, subsectionNamesByUsageKey, canEdit, position, courseName }: CriteriaGroupBoxProps,
) => {
  const intl = useIntl();
  const {
    selection,
    placeholder,
    selectGroup,
    status,
    groupsIndex,
    systemDefaultProfile,
    updateGroupOperator,
    addPlaceholderRuleBox,
    setPlaceholderLogicOperator,
    hasPlaceholder,
    isAssociating,
    courseList,
    requestRemoval,
    isDeletingGroupOrRuleBoxOrCriterion,
    discardPlaceholderGroup,
    keyboardFocusRequest,
    consumeKeyboardFocusRequest,
  } = useCompetencyAssociations();
  const ref = useRef<HTMLDivElement>(null);

  // `null` is the placeholder group's id in `CriteriaSelection`.
  const groupId = group?.id ?? null;
  const logicOperator = group ? group.logicOperator : placeholder.logicOperator;
  const isSelected = selection?.groupId === groupId;
  const boxes = status === 'success' && groupId !== null
    ? ruleBoxesForGroup(groupId, groupsIndex, systemDefaultProfile)
    : [];
  const hasSelectedBox = isSelected &&
    (selection.ruleKey === null || boxes.some((box) => box.key === selection.ruleKey));

  useEffect(() => {
    if (isSelected && !hasSelectedBox) {
      ref.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [isSelected, hasSelectedBox]);

  const selectButtonRef = useRef<HTMLButtonElement>(null);
  const groupRequest = group !== undefined
      && keyboardFocusRequest?.kind === 'group'
      && keyboardFocusRequest.groupId === group.id
    ? keyboardFocusRequest
    : null;
  const takesKeyboardFocus = groupRequest !== null;
  // A moved selection scrolls its own rule box into view. An unchanged one has nothing else to scroll, so the focus does.
  const selectionMoved = groupRequest?.selectionMoved ?? false;

  useEffect(() => {
    if (takesKeyboardFocus && selectButtonRef.current) {
      // Moving focus off a text field would interrupt the author's typing.
      if (!isInputOrEditableElement(document.activeElement)) {
        // The dialog's own focus return runs in a microtask when it unmounts, so this one is queued to land after it.
        queueMicrotask(() => selectButtonRef.current?.focus({ preventScroll: selectionMoved }));
      }
      consumeKeyboardFocusRequest();
    }
  }, [takesKeyboardFocus, selectionMoved, consumeKeyboardFocusRequest]);

  const isMenuDisabled = isDeletingGroupOrRuleBoxOrCriterion || isAssociating;

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

  let disabledReason: AddControlProps['disabledReason'] = null;
  if (isAssociating) {
    disabledReason = 'saving';
  } else if (courseList.isPlaceholderData) {
    // A reload can list other courses, which would discard an unsaved box started now.
    disabledReason = 'loading';
  } else if (isDeletingGroupOrRuleBoxOrCriterion) {
    disabledReason = 'deleting';
  } else if (hasPlaceholder) {
    disabledReason = 'placeholder';
  }

  return (
    <div
      ref={ref}
      className={classNames('criteria-group-box', { 'criteria-group-box--selected': isSelected })}
    >
      {canEdit
        ? (
          // The operator dropdown is a button, so the select control is a sibling laid over the band.
          <div className="criteria-group-box__header-row d-flex align-items-center">
            <div className="criteria-group-box__header flex-grow-1">
              {group && (
                <button
                  ref={selectButtonRef}
                  type="button"
                  className="criteria-group-box__select-button"
                  aria-current={isSelected}
                  onClick={() => selectGroup(group.id)}
                >
                  <span className="sr-only">{sentenceLabel}</span>
                </button>
              )}
              {sentence}
            </div>
            <MoreActionsMenu
              id={`rule-group-menu-toggle-${group?.id ?? 'placeholder'}`}
              toggleLabel={group
                ? intl.formatMessage(messages.ruleGroupMoreActionsLabel, { position, courseName })
                : intl.formatMessage(messages.placeholderRuleGroupMoreActionsLabel, { courseName })}
              removeLabel={intl.formatMessage(messages.removeRuleGroupMenuItem)}
              disabled={isMenuDisabled}
              onRemove={() => (
                group
                  ? requestRemoval({ kind: RemovalTargetKind.RuleGroup, groupId: group.id })
                  : discardPlaceholderGroup()
              )}
            />
          </div>
        )
        : (
          <button
            ref={selectButtonRef}
            type="button"
            className="criteria-group-box__header"
            aria-current={isSelected}
            onClick={() => group && selectGroup(group.id)}
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
            position={position}
            courseName={courseName}
          />
          {canEdit && groupId !== null && (
            <AddControl
              label={intl.formatMessage(messages.addRuleButtonLabel)}
              accessibleLabel={intl.formatMessage(messages.addRuleAccessibleLabel)}
              disabledReason={disabledReason}
              onClick={() => addPlaceholderRuleBox(groupId)}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default CriteriaGroupBox;
