import { singleGroupResponse } from './__mocks__';
import type { ProviderState } from './CompetencyAssociationsContext';
import {
  clearStaleScoreSettingsOpen,
  initialPlaceholder,
  isPlaceholderOrphaned,
  reducePlaceholderAction,
} from './placeholderState';
import { buildCompetencyCriteriaGroupsIndex } from './utils';

describe('isPlaceholderOrphaned', () => {
  const index = buildCompetencyCriteriaGroupsIndex(singleGroupResponse);

  it.each([
    ['no focus', null, initialPlaceholder, false],
    ['a real rule box focus', { groupId: 99, ruleKey: 'k' }, initialPlaceholder, false],
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
  ])('for %s returns %s', (_label, focus, placeholder, expected) => {
    expect(isPlaceholderOrphaned(focus, placeholder, index)).toBe(expected);
  });
});

describe('opensScoreSettings', () => {
  const baseState: ProviderState = {
    tagId: 1,
    generation: 0,
    focus: null,
    placeholder: initialPlaceholder,
    placeholderDuplicateRejected: false,
    placeholderDuplicateRejectionCount: 0,
    pendingCourseId: null,
    initialFocusDone: true,
    settled: true,
  };
  const afterAdd = reducePlaceholderAction(baseState, { type: 'addPlaceholderRuleBox', groupId: 10 });

  it('is false in the initial placeholder', () => {
    expect(initialPlaceholder.opensScoreSettings).toBe(false);
  });

  it.each(
    [
      ['addPlaceholderRuleBox', { type: 'addPlaceholderRuleBox', groupId: 10 }],
      ['addPlaceholderGroup', { type: 'addPlaceholderGroup', parentRuleGroupId: 1 }],
    ] as const,
  )('is set by %s', (_label, action) => {
    expect(reducePlaceholderAction(baseState, action).placeholder.opensScoreSettings).toBe(true);
  });

  it('is cleared when the score is set', () => {
    const next = reducePlaceholderAction(afterAdd, {
      type: 'setPlaceholderRulePayload',
      rulePayload: { op: 'gte', value: 0.8, scale: 'percent' },
    });

    expect(next.placeholder.opensScoreSettings).toBe(false);
  });

  it('survives a change of the logic operator', () => {
    const next = reducePlaceholderAction(afterAdd, { type: 'setPlaceholderLogicOperator', logicOperator: 'AND' });

    expect(next.placeholder.opensScoreSettings).toBe(true);
  });

  it('is cleared by discardPlaceholder', () => {
    const next = reducePlaceholderAction(afterAdd, { type: 'discardPlaceholder' });

    expect(next.placeholder.opensScoreSettings).toBe(false);
  });

  describe('clearStaleScoreSettingsOpen', () => {
    it('clears the flag when focus moves without a new placeholder', () => {
      const moved = { ...afterAdd, focus: { groupId: 11, ruleKey: null } };

      expect(clearStaleScoreSettingsOpen(afterAdd, moved).placeholder.opensScoreSettings).toBe(false);
    });

    it('keeps the flag when an add action changed the placeholder along with the focus', () => {
      expect(clearStaleScoreSettingsOpen(baseState, afterAdd).placeholder.opensScoreSettings).toBe(true);
    });

    it('keeps the flag when focus is unchanged', () => {
      const same = { ...afterAdd, tagId: 2 };

      expect(clearStaleScoreSettingsOpen(afterAdd, same).placeholder.opensScoreSettings).toBe(true);
    });
  });
});
