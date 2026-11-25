import { singleGroupResponse } from './__mocks__';
import type { ProviderState } from './CompetencyAssociationsContext';
import {
  clearJustAddedOnSelectionMove,
  initialPlaceholder,
  isPlaceholderOrphaned,
  reducePlaceholderAction,
} from './placeholderState';
import { buildCompetencyCriteriaGroupsIndex } from './utils';

describe('isPlaceholderOrphaned', () => {
  const index = buildCompetencyCriteriaGroupsIndex(singleGroupResponse);

  it.each([
    ['no selection', null, initialPlaceholder, false],
    ['a real rule box selection', { groupId: 99, ruleKey: 'k' }, initialPlaceholder, false],
    ['a placeholder rule box in a group that exists', { groupId: 10, ruleKey: null }, initialPlaceholder, false],
    ['a placeholder rule box in a missing group', { groupId: 99, ruleKey: null }, initialPlaceholder, true],
    [
      'a placeholder group under a parent that exists',
      { groupId: null, ruleKey: null },
      { ...initialPlaceholder, parentRuleGroupId: 1 },
      false,
    ],
    [
      'a placeholder group under a missing parent',
      { groupId: null, ruleKey: null },
      { ...initialPlaceholder, parentRuleGroupId: 99 },
      true,
    ],
  ])('for %s returns %s', (_label, selection, placeholder, expected) => {
    expect(isPlaceholderOrphaned(selection, placeholder, index)).toBe(expected);
  });
});

describe('justAdded', () => {
  const baseState: ProviderState = {
    tagId: 1,
    generation: 0,
    selection: null,
    placeholder: initialPlaceholder,
    placeholderDuplicateRejected: false,
    placeholderDuplicateRejectionCount: 0,
    keyboardFocusRequest: null,
    pendingCourseId: null,
    pendingNewCourseSnapshot: null,
    initialSelectionDone: true,
    settled: true,
    scopeCourseKeys: undefined,
  };
  const afterAdd = reducePlaceholderAction(baseState, { type: 'addPlaceholderRuleBox', groupId: 10 });

  it('is false in the initial placeholder', () => {
    expect(initialPlaceholder.justAdded).toBe(false);
  });

  it.each(
    [
      ['addPlaceholderRuleBox', { type: 'addPlaceholderRuleBox', groupId: 10 }],
      ['addPlaceholderGroup', { type: 'addPlaceholderGroup', parentRuleGroupId: 1 }],
    ] as const,
  )('is set by %s', (_label, action) => {
    expect(reducePlaceholderAction(baseState, action).placeholder.justAdded).toBe(true);
  });

  it('is cleared when the score is set', () => {
    const next = reducePlaceholderAction(afterAdd, {
      type: 'setPlaceholderRulePayload',
      rulePayload: { op: 'gte', value: 0.8, scale: 'percent' },
    });

    expect(next.placeholder.justAdded).toBe(false);
  });

  it('survives a change of the logic operator', () => {
    const next = reducePlaceholderAction(afterAdd, { type: 'setPlaceholderLogicOperator', logicOperator: 'AND' });

    expect(next.placeholder.justAdded).toBe(true);
  });

  it('is cleared by discardPlaceholder', () => {
    const next = reducePlaceholderAction(afterAdd, { type: 'discardPlaceholder' });

    expect(next.placeholder.justAdded).toBe(false);
  });

  describe('clearJustAddedOnSelectionMove', () => {
    it('clears the flag when selection moves without a new placeholder', () => {
      const moved = { ...afterAdd, selection: { groupId: 11, ruleKey: null } };

      expect(clearJustAddedOnSelectionMove(afterAdd, moved).placeholder.justAdded).toBe(false);
    });

    it('keeps the flag when an add action changed the placeholder along with the selection', () => {
      expect(clearJustAddedOnSelectionMove(baseState, afterAdd).placeholder.justAdded).toBe(true);
    });

    it('keeps the flag when selection is unchanged', () => {
      const same = { ...afterAdd, tagId: 2 };

      expect(clearJustAddedOnSelectionMove(afterAdd, same).placeholder.justAdded).toBe(true);
    });
  });
});
