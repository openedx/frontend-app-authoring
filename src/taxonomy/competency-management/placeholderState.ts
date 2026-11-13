import { useCallback } from 'react';
import type { Dispatch } from 'react';

import type { CompetencyGroupLogicOperator, GradeRulePayload } from './data/types';
import type { CriteriaFocus, ProviderAction, ProviderState } from './CompetencyAssociationsContext';
import type { CompetencyCriteriaGroupsIndex } from './utils';

/** The author's choices on the placeholder group or rule box. The rule payload is shared by both shapes, since only
 * one placeholder exists at a time.
 */
export interface CriteriaPlaceholder {
  parentRuleGroupId: number | null;
  logicOperator: CompetencyGroupLogicOperator;
  rulePayload: GradeRulePayload | null;
  /** Whether the placeholder box's score settings open by themselves when it mounts. True only right after an
   * add action, so focusing an empty saved group shows its placeholder box with the popover closed.
   */
  opensScoreSettings: boolean;
}

export const initialPlaceholder: CriteriaPlaceholder = {
  parentRuleGroupId: null,
  logicOperator: 'OR',
  rulePayload: null,
  opensScoreSettings: false,
};

export type PlaceholderAction =
  | { type: 'addPlaceholderRuleBox'; groupId: number; }
  | { type: 'addPlaceholderGroup'; parentRuleGroupId: number; }
  | { type: 'setPlaceholderLogicOperator'; logicOperator: CompetencyGroupLogicOperator; }
  | { type: 'setPlaceholderRulePayload'; rulePayload: GradeRulePayload; }
  | { type: 'discardPlaceholder'; };

export function reducePlaceholderAction(state: ProviderState, action: PlaceholderAction): ProviderState {
  switch (action.type) {
    case 'addPlaceholderRuleBox':
      return {
        ...state,
        focus: { groupId: action.groupId, ruleKey: null },
        placeholder: { ...state.placeholder, rulePayload: null, opensScoreSettings: true },
        pendingCourseId: null,
      };
    case 'addPlaceholderGroup':
      return {
        ...state,
        focus: { groupId: null, ruleKey: null },
        placeholder: { ...initialPlaceholder, parentRuleGroupId: action.parentRuleGroupId, opensScoreSettings: true },
        pendingCourseId: null,
      };
    case 'setPlaceholderLogicOperator':
      return { ...state, placeholder: { ...state.placeholder, logicOperator: action.logicOperator } };
    case 'discardPlaceholder':
      return { ...state, focus: null, placeholder: { ...state.placeholder, opensScoreSettings: false } };
    case 'setPlaceholderRulePayload':
      return {
        ...state,
        placeholder: { ...state.placeholder, rulePayload: action.rulePayload, opensScoreSettings: false },
      };
    default:
      return state;
  }
}

/** Clears `opensScoreSettings` when an action moved the focus without replacing the placeholder, since the
 * placeholder box that now shows was not just added. An add action replaces the placeholder, so it keeps the flag.
 */
export function clearStaleScoreSettingsOpen(previous: ProviderState, next: ProviderState): ProviderState {
  const focusMoved = next.focus !== previous.focus;
  if (!focusMoved || next.placeholder !== previous.placeholder || !next.placeholder.opensScoreSettings) {
    return next;
  }
  return { ...next, placeholder: { ...next.placeholder, opensScoreSettings: false } };
}

/** Whether the focused placeholder's real group, or its parent for a placeholder group, left the groups tree. */
export function isPlaceholderOrphaned(
  focus: CriteriaFocus | null,
  placeholder: CriteriaPlaceholder,
  groupsIndex: CompetencyCriteriaGroupsIndex,
): boolean {
  if (focus === null || focus.ruleKey !== null) {
    return false;
  }
  const anchorId = focus.groupId ?? placeholder.parentRuleGroupId;
  return anchorId !== null && !groupsIndex.groupsById.has(anchorId);
}

/** Actions that change what the author sees in the placeholder, so a rejection no longer applies. */
export const PLACEHOLDER_REJECTION_CLEARING_ACTIONS: ReadonlySet<ProviderAction['type']> = new Set([
  'competencyChanged',
  'focusGroup',
  'focusRuleBox',
  'setFocus',
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
  discardPlaceholder: () => void;
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

  const discardPlaceholder = useCallback(() => {
    dispatch({ type: 'discardPlaceholder' });
  }, [dispatch]);

  return {
    addPlaceholderRuleBox,
    addPlaceholderGroup,
    setPlaceholderLogicOperator,
    setPlaceholderRulePayload,
    discardPlaceholder,
  };
}
