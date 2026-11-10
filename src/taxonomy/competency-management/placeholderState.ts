import { useCallback } from 'react';
import type { Dispatch } from 'react';

import type { CompetencyGroupLogicOperator, GradeRulePayload } from './data/types';
import type { ProviderState } from './CompetencyAssociationsContext';

/** The author's choices on the placeholder group or rule box. The rule payload is shared by both shapes, since only
 * one placeholder exists at a time.
 */
export interface CriteriaPlaceholder {
  parentRuleGroupId: number | null;
  logicOperator: CompetencyGroupLogicOperator;
  rulePayload: GradeRulePayload | null;
}

export const initialPlaceholder: CriteriaPlaceholder = {
  parentRuleGroupId: null,
  logicOperator: 'OR',
  rulePayload: null,
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
        placeholder: { ...state.placeholder, rulePayload: null },
        pendingCourseId: null,
      };
    case 'addPlaceholderGroup':
      return {
        ...state,
        focus: { groupId: null, ruleKey: null },
        placeholder: { ...initialPlaceholder, parentRuleGroupId: action.parentRuleGroupId },
        pendingCourseId: null,
      };
    case 'setPlaceholderLogicOperator':
      return { ...state, placeholder: { ...state.placeholder, logicOperator: action.logicOperator } };
    case 'discardPlaceholder':
      return { ...state, focus: null };
    case 'setPlaceholderRulePayload':
      return { ...state, placeholder: { ...state.placeholder, rulePayload: action.rulePayload } };
    default:
      return state;
  }
}

/** Actions that change what the author sees in the placeholder, so a rejection no longer applies. */
export const PLACEHOLDER_REJECTION_CLEARING_ACTIONS: ReadonlySet<string> = new Set([
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

export function usePlaceholderActions(dispatch: Dispatch<PlaceholderAction>) {
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
