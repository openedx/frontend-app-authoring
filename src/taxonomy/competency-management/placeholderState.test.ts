import { singleGroupResponse } from './__mocks__';
import { initialPlaceholder, isPlaceholderOrphaned } from './placeholderState';
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
