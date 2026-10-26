import type { CriteriaPlaceholder } from './CompetencyAssociationsContext';
import type {
  CompetencyCriteriaGroupsResponse,
  CompetencyCriterion,
  CompetencyRuleProfile,
} from './data/types';
import { resolveCreateTarget, courseKeyOfFocus } from './criterionTarget';
import { buildCompetencyCriteriaGroupsIndex, ruleBoxesForGroup } from './utils';

const C = 'course-v1:OrgX+CS101+2024';

const profile: CompetencyRuleProfile = {
  id: 1,
  scopeType: 'system_default',
  ruleType: 'grade',
  rulePayload: { op: 'gte', value: 0.7, scale: 'percent' },
  archived: false,
};

const buildCriterion = (overrides: Partial<CompetencyCriterion>): CompetencyCriterion => ({
  id: 1,
  objectId: 'block-a',
  groupId: 10,
  ruleProfileId: null,
  ruleTypeOverride: null,
  rulePayloadOverride: null,
  ...overrides,
});

const buildGroup = (id: number, parentId: number | null, courseKey: string | null) => ({
  id,
  parentId,
  tagId: 42,
  courseKey,
  name: 'group',
  ordering: 0,
  logicOperator: 'AND' as const,
  archived: false,
});

// Course group 1 holds leaf 10 (default rule taken) and leaf 11 (only a non-default rule).
const response: CompetencyCriteriaGroupsResponse = {
  groups: [buildGroup(100, null, null), buildGroup(1, 100, C), buildGroup(10, 1, null), buildGroup(11, 1, null)],
  criteria: [
    buildCriterion({ id: 101, groupId: 10 }),
    buildCriterion({
      id: 103,
      objectId: 'block-c',
      groupId: 11,
      ruleTypeOverride: 'grade',
      rulePayloadOverride: { op: 'lte', value: 0.5, scale: 'percent' },
    }),
  ],
};

const index = buildCompetencyCriteriaGroupsIndex(response);
const untouched: CriteriaPlaceholder = { parentRuleGroupId: null, logicOperator: 'OR', rulePayload: null };
const changed = { op: 'gte', value: 0.85, scale: 'percent' } as const;
const defaultBoxKey = ruleBoxesForGroup(10, index, profile)[0].key;
const defaultBoxPayload = ruleBoxesForGroup(10, index, profile)[0].rule.rulePayload;

describe('courseKeyOfFocus', () => {
  it('resolves a real group through its parent course group', () => {
    expect(courseKeyOfFocus({ groupId: 10, ruleKey: 'x' }, untouched, index)).toBe(C);
  });

  it('resolves a placeholder group through the placeholder parent', () => {
    expect(courseKeyOfFocus({ groupId: null, ruleKey: null }, { ...untouched, parentRuleGroupId: 1 }, index)).toBe(C);
  });

  it('returns undefined without focus', () => {
    expect(courseKeyOfFocus(null, { ...untouched, parentRuleGroupId: 1 }, index)).toBeUndefined();
  });

  it('returns undefined for an unknown group', () => {
    expect(courseKeyOfFocus({ groupId: 999, ruleKey: null }, untouched, index)).toBeUndefined();
  });
});

describe('resolveCreateTarget', () => {
  const placeholderGroupFocus = { groupId: null, ruleKey: null };
  const underCourse = { ...untouched, parentRuleGroupId: 1 };

  it('creates in the default place without focus', () => {
    expect(resolveCreateTarget(C, null, untouched, index, profile)).toEqual({ kind: 'create', fields: {} });
  });

  it('targets the focused real rule box with its own rule', () => {
    expect(resolveCreateTarget(C, { groupId: 10, ruleKey: defaultBoxKey }, untouched, index, profile)).toEqual({
      kind: 'create',
      fields: { group_id: 10, rule_type_override: 'grade', rule_payload_override: defaultBoxPayload },
    });
  });

  it('ignores a real rule box focused in another course', () => {
    expect(
      resolveCreateTarget('course-v1:Other+X+1', { groupId: 10, ruleKey: defaultBoxKey }, untouched, index, profile),
    )
      .toEqual({ kind: 'create', fields: {} });
  });

  it('targets only the group for a stale rule key', () => {
    expect(resolveCreateTarget(C, { groupId: 10, ruleKey: 'nope' }, untouched, index, profile))
      .toEqual({ kind: 'create', fields: { group_id: 10 } });
  });

  it('rejects an untouched placeholder rule box whose default rule is taken', () => {
    expect(resolveCreateTarget(C, { groupId: 10, ruleKey: null }, untouched, index, profile))
      .toEqual({ kind: 'duplicate' });
  });

  it('sends the override pair for a changed placeholder rule box', () => {
    expect(
      resolveCreateTarget(C, { groupId: 10, ruleKey: null }, { ...untouched, rulePayload: changed }, index, profile),
    )
      .toEqual({
        kind: 'create',
        fields: { group_id: 10, rule_type_override: 'grade', rule_payload_override: changed },
      });
  });

  it('sends only the group for an untouched placeholder rule box with a free default', () => {
    expect(resolveCreateTarget(C, { groupId: 11, ruleKey: null }, untouched, index, profile))
      .toEqual({ kind: 'create', fields: { group_id: 11 } });
  });

  it('sends only the operator for an untouched placeholder group', () => {
    expect(resolveCreateTarget(C, placeholderGroupFocus, underCourse, index, profile))
      .toEqual({ kind: 'create', fields: { logic_operator: 'OR' } });
  });

  it('sends operator and override pair for a changed placeholder group', () => {
    expect(resolveCreateTarget(
      C,
      placeholderGroupFocus,
      { ...underCourse, logicOperator: 'AND', rulePayload: changed },
      index,
      profile,
    )).toEqual({
      kind: 'create',
      fields: { logic_operator: 'AND', rule_type_override: 'grade', rule_payload_override: changed },
    });
  });

  it('ignores a placeholder group from another course', () => {
    expect(resolveCreateTarget('course-v1:Other+X+1', placeholderGroupFocus, underCourse, index, profile))
      .toEqual({ kind: 'create', fields: {} });
  });

  it('ignores a placeholder group without a parent', () => {
    expect(resolveCreateTarget(C, placeholderGroupFocus, untouched, index, profile))
      .toEqual({ kind: 'create', fields: {} });
  });

  it('never rejects a placeholder group as a duplicate', () => {
    expect(
      resolveCreateTarget(
        C,
        placeholderGroupFocus,
        { ...underCourse, rulePayload: defaultBoxPayload },
        index,
        profile,
      ).kind,
    ).toBe('create');
  });
});
