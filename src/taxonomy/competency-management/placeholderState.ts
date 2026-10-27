import { useCallback } from 'react';
import type { Dispatch } from 'react';

import type { CompetencyGroupLogicOperator, GradeRulePayload } from './data/types';
import type { CriteriaSelection, ProviderAction, ProviderState } from './CompetencyAssociationsContext';
import type { CompetencyCriteriaGroupsIndex } from './utils';

/** The author's choices on the placeholder group or rule box. The rule payload is shared by both shapes, since only
 * one placeholder exists at a time.
 */
export interface CriteriaPlaceholder {
  parentRuleGroupId: number | null;
  logicOperator: CompetencyGroupLogicOperator;
  rulePayload: GradeRulePayload | null;
  /**
   * True from an add action until the placeholder's score is set or the selection moves. `RuleBoxList` uses it to open
   * the score settings or focus their button once, on the box the author just added.
   */
  justAdded: boolean;
}

export const initialPlaceholder: CriteriaPlaceholder = {
  parentRuleGroupId: null,
  logicOperator: 'OR',
  rulePayload: null,
  justAdded: false,
};

export type PlaceholderAction =
  | { type: 'addPlaceholderRuleBox'; groupId: number; }
  | { type: 'addPlaceholderGroup'; parentRuleGroupId: number; }
  | { type: 'setPlaceholderLogicOperator'; logicOperator: CompetencyGroupLogicOperator; }
  | { type: 'setPlaceholderRulePayload'; rulePayload: GradeRulePayload; }
  | { type: 'discardPlaceholder'; selection?: CriteriaSelection | null; };

export function reducePlaceholderAction(state: ProviderState, action: PlaceholderAction): ProviderState {
  switch (action.type) {
    case 'addPlaceholderRuleBox':
      return {
        ...state,
        selection: { groupId: action.groupId, ruleKey: null },
        placeholder: { ...state.placeholder, rulePayload: null, justAdded: true },
        pendingCourseId: null,
      };
    case 'addPlaceholderGroup':
      return {
        ...state,
        selection: { groupId: null, ruleKey: null },
        placeholder: { ...initialPlaceholder, parentRuleGroupId: action.parentRuleGroupId, justAdded: true },
        pendingCourseId: null,
      };
    case 'setPlaceholderLogicOperator':
      return { ...state, placeholder: { ...state.placeholder, logicOperator: action.logicOperator } };
    case 'discardPlaceholder':
      return { ...state, selection: action.selection ?? null, placeholder: initialPlaceholder };
    case 'setPlaceholderRulePayload':
      return {
        ...state,
        placeholder: { ...state.placeholder, rulePayload: action.rulePayload, justAdded: false },
      };
    default:
      return state;
  }
}

/**
 * Clears `justAdded` when an action moved the selection but kept the same placeholder object. An add action replaces
 * the placeholder object, so only a selection move onto an existing placeholder (such as clicking an empty saved group)
 * is cleared here.
 */
export function clearJustAddedOnSelectionMove(previous: ProviderState, next: ProviderState): ProviderState {
  const selectionMoved = next.selection !== previous.selection;
  if (!selectionMoved || next.placeholder !== previous.placeholder || !next.placeholder.justAdded) {
    return next;
  }
  return { ...next, placeholder: { ...next.placeholder, justAdded: false } };
}

/** Whether the selected placeholder's real group, or its parent for a placeholder group, left the groups tree. */
export function isPlaceholderOrphaned(
  selection: CriteriaSelection | null,
  placeholder: CriteriaPlaceholder,
  groupsIndex: CompetencyCriteriaGroupsIndex,
): boolean {
  if (selection === null || selection.ruleKey !== null) {
    return false;
  }
  const anchorId = selection.groupId ?? placeholder.parentRuleGroupId;
  return anchorId !== null && !groupsIndex.groupsById.has(anchorId);
}

/** Actions that change what the author sees in the placeholder, so a rejection no longer applies. */
export const PLACEHOLDER_REJECTION_CLEARING_ACTIONS: ReadonlySet<ProviderAction['type']> = new Set([
  'competencyChanged',
  'selectGroup',
  'selectRuleBox',
  'setSelection',
  'addPlaceholderRuleBox',
  'addPlaceholderGroup',
  'setPlaceholderRulePayload',
  'discardPlaceholder',
  'createSucceeded',
]);

export interface PlaceholderActions {
  addPlaceholderRuleBox: (groupId: number) => void;
  addPlaceholderGroup: (parentRuleGroupId: number) => void;
  setPlaceholderLogicOperator: (logicOperator: CompetencyGroupLogicOperator) => void;
  setPlaceholderRulePayload: (rulePayload: GradeRulePayload) => void;
  discardPlaceholder: (next?: CriteriaSelection | null) => void;
}

export function usePlaceholderActions(dispatch: Dispatch<PlaceholderAction>): PlaceholderActions {
  const addPlaceholderRuleBox = useCallback((groupId: number) => {
    dispatch({ type: 'addPlaceholderRuleBox', groupId });
  }, [dispatch]);

  const addPlaceholderGroup = useCallback((parentRuleGroupId: number) => {
    dispatch({ type: 'addPlaceholderGroup', parentRuleGroupId });
  }, [dispatch]);

  const setPlaceholderLogicOperator = useCallback((logicOperator: CompetencyGroupLogicOperator) => {
    dispatch({ type: 'setPlaceholderLogicOperator', logicOperator });
  }, [dispatch]);

  const setPlaceholderRulePayload = useCallback((rulePayload: GradeRulePayload) => {
    dispatch({ type: 'setPlaceholderRulePayload', rulePayload });
  }, [dispatch]);

  const discardPlaceholder = useCallback((next: CriteriaSelection | null = null) => {
    dispatch({ type: 'discardPlaceholder', selection: next });
  }, [dispatch]);

  return {
    addPlaceholderRuleBox,
    addPlaceholderGroup,
    setPlaceholderLogicOperator,
    setPlaceholderRulePayload,
    discardPlaceholder,
  };
}
