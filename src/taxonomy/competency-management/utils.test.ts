import type {
  CompetencyCriteriaTree,
  CompetencyCriterion,
  GradeRulePayload,
  RuleBox,
} from './data/types';
import type { CompetencyCriteriaGroupsIndex, PageOrderSnapshot } from './utils';
import {
  associatedObjectIds,
  bottomTierGroupsForCourse,
  buildCompetencyCriteriaGroupsIndex,
  effectiveRuleOf,
  selectionTargetAfterRemoval,
  isRuleTakenInGroup,
  lastBottomTierGroupForCourse,
  lastRuleKeyIn,
  nextUnusedScore,
  ruleBoxesForGroup,
  ruleKeyAfterRemoval,
  ruleKeyOf,
  snapshotPageOrder,
  visibleCourseGroups,
} from './utils';
import { systemDefaultProfile } from './__mocks__';

const buildCriterion = (overrides: Partial<CompetencyCriterion> = {}): CompetencyCriterion => ({
  id: 1,
  objectId: 'block-a',
  groupId: 10,
  ruleProfileId: null,
  ruleTypeOverride: null,
  rulePayloadOverride: null,
  ...overrides,
});

// The competency's root group (id 100, instance-wide, never rendered), one
// course-level group under it (id 1, "course-v1:OrgX+CS101+2024") with two
// leaf groups: group 10 (ordering 0) holds two rule boxes (criteria 101+102
// share the default profile's rule, criterion 104 overrides to a
// different one); group 11 (ordering 1) holds one rule box (criterion
// 103). Group ids and array order are deliberately out of numeric/array
// order so tests can't pass by accident from iterating in id or array
// order instead of by the fields the derivation actually sorts on.
const fixtureResponse: CompetencyCriteriaTree = {
  groups: [
    {
      id: 100,
      parentId: null,
      tagId: 42,
      courseKey: null,
      name: 'root',
      ordering: 0,
      logicOperator: 'OR',
    },
    {
      id: 1,
      parentId: 100,
      tagId: 42,
      courseKey: 'course-v1:OrgX+CS101+2024',
      name: 'course',
      ordering: 0,
      logicOperator: 'OR',
    },
    {
      id: 11,
      parentId: 1,
      tagId: 42,
      courseKey: null,
      name: 'leaf',
      ordering: 1,
      logicOperator: 'OR',
    },
    {
      id: 10,
      parentId: 1,
      tagId: 42,
      courseKey: null,
      name: 'leaf',
      ordering: 0,
      logicOperator: 'OR',
    },
  ],
  criteria: [
    buildCriterion({
      id: 101,
      objectId: 'block-a',
      groupId: 10,
      ruleTypeOverride: 'grade',
      rulePayloadOverride: { op: 'gte', value: 0.7, scale: 'percent' },
    }),
    // No override: resolves through `systemDefaultProfile`, which happens
    // to carry the exact same rule as criterion 101's override above - so
    // this criterion must land in the *same* rule box as 101.
    buildCriterion({ id: 102, objectId: 'block-b', groupId: 10 }),
    buildCriterion({
      id: 104,
      objectId: 'block-d',
      groupId: 10,
      ruleTypeOverride: 'grade',
      rulePayloadOverride: { op: 'lte', value: 0.9, scale: 'percent' },
    }),
    buildCriterion({
      id: 103,
      objectId: 'block-c',
      groupId: 11,
      ruleTypeOverride: 'grade',
      rulePayloadOverride: { op: 'lte', value: 0.5, scale: 'percent' },
    }),
  ],
};

describe('buildCompetencyCriteriaGroupsIndex', () => {
  it('indexes groups by id, by parent, and criteria by containing group', () => {
    const index = buildCompetencyCriteriaGroupsIndex(fixtureResponse);

    expect(index.groupsById.get(100)).toEqual(fixtureResponse.groups[0]);
    expect(index.groupsById.get(1)).toEqual(fixtureResponse.groups[1]);
    expect(index.groupsById.get(11)).toEqual(fixtureResponse.groups[2]);
    expect(index.groupsById.get(10)).toEqual(fixtureResponse.groups[3]);

    const childrenOfCourseGroup = index.childGroupsByParentId.get(1) ?? [];
    expect(childrenOfCourseGroup.map((g) => g.id).sort((a, b) => a - b)).toEqual([10, 11]);
    expect(index.childGroupsByParentId.get(10)).toBeUndefined();

    expect((index.criteriaByGroupId.get(10) ?? []).map((c) => c.id).sort((a, b) => a - b)).toEqual([101, 102, 104]);
    expect((index.criteriaByGroupId.get(11) ?? []).map((c) => c.id)).toEqual([103]);

    expect(index.courseGroups).toEqual([fixtureResponse.groups[1]]);
  });
});

describe('effectiveRuleOf', () => {
  it('returns the criterion\'s own override fields when set', () => {
    const criterion = buildCriterion({
      ruleTypeOverride: 'grade',
      rulePayloadOverride: { op: 'eq', value: 1, scale: 'percent' },
    });
    expect(effectiveRuleOf(criterion, systemDefaultProfile)).toEqual({
      ruleType: 'grade',
      rulePayload: { op: 'eq', value: 1, scale: 'percent' },
    });
  });

  it('falls back to the system default profile when no override is set', () => {
    const criterion = buildCriterion();
    expect(effectiveRuleOf(criterion, systemDefaultProfile)).toEqual({
      ruleType: systemDefaultProfile.ruleType,
      rulePayload: systemDefaultProfile.rulePayload,
    });
  });
});

describe('ruleKeyOf', () => {
  it('is stable regardless of the rule payload object\'s own key-insertion order', () => {
    // Same fields, same values, deliberately built with a different
    // property insertion order - `JSON.stringify` would serialize these
    // two objects into different strings; `ruleKeyOf` must not.
    const payloadOpFirst: GradeRulePayload = { op: 'gte', value: 0.7, scale: 'percent' };
    const payloadScaleFirst: GradeRulePayload = { scale: 'percent', value: 0.7, op: 'gte' } as GradeRulePayload;
    expect(JSON.stringify(payloadOpFirst)).not.toEqual(JSON.stringify(payloadScaleFirst));

    const criterionA = buildCriterion({ ruleTypeOverride: 'grade', rulePayloadOverride: payloadOpFirst });
    const criterionB = buildCriterion({ ruleTypeOverride: 'grade', rulePayloadOverride: payloadScaleFirst });

    expect(ruleKeyOf(criterionA, systemDefaultProfile)).toEqual(ruleKeyOf(criterionB, systemDefaultProfile));
  });
});

describe('ruleBoxesForGroup', () => {
  it('groups criteria sharing an effective rule into one box, and different rules into separate boxes', () => {
    const index = buildCompetencyCriteriaGroupsIndex(fixtureResponse);
    const boxes = ruleBoxesForGroup(10, index, systemDefaultProfile);

    expect(boxes).toHaveLength(2);
    expect(boxes[0].criteria.map((c) => c.id).sort((a, b) => a - b)).toEqual([101, 102]);
    expect(boxes[0].rule).toEqual({ ruleType: 'grade', rulePayload: { op: 'gte', value: 0.7, scale: 'percent' } });
    expect(boxes[1].criteria.map((c) => c.id)).toEqual([104]);
    expect(boxes[1].rule).toEqual({ ruleType: 'grade', rulePayload: { op: 'lte', value: 0.9, scale: 'percent' } });
  });

  it('returns no boxes for a group with no criteria', () => {
    const index = buildCompetencyCriteriaGroupsIndex(fixtureResponse);
    expect(ruleBoxesForGroup(999, index, systemDefaultProfile)).toEqual([]);
  });
});

describe('lastRuleKeyIn', () => {
  it('returns the last box\'s rule key for a populated group', () => {
    const index = buildCompetencyCriteriaGroupsIndex(fixtureResponse);
    expect(lastRuleKeyIn(10, index, systemDefaultProfile)).toEqual('grade:lte:0.9:percent');
  });

  it('returns null for a group with no criteria', () => {
    const index = buildCompetencyCriteriaGroupsIndex(fixtureResponse);
    expect(lastRuleKeyIn(999, index, systemDefaultProfile)).toBeNull();
  });
});

// The group with the higher id has the lower `ordering`, so sorting by `id` instead of `ordering` fails.
const reversedIdsResponse: CompetencyCriteriaTree = {
  groups: [
    {
      id: 1,
      parentId: 100,
      tagId: 42,
      courseKey: 'course-v1:OrgX+CS101+2024',
      name: 'course',
      ordering: 0,
      logicOperator: 'OR',
    },
    {
      id: 20,
      parentId: 1,
      tagId: 42,
      courseKey: null,
      name: 'leaf',
      ordering: 1,
      logicOperator: 'OR',
    },
    {
      id: 30,
      parentId: 1,
      tagId: 42,
      courseKey: null,
      name: 'leaf',
      ordering: 0,
      logicOperator: 'OR',
    },
  ],
  criteria: [],
};

describe('ruleKeyAfterRemoval', () => {
  it.each([
    { name: 'the second of three', vanished: 'b', keysAfter: ['a', 'c'], expected: 'a' },
    { name: 'the first of three', vanished: 'a', keysAfter: ['b', 'c'], expected: 'b' },
    { name: 'the third of three', vanished: 'c', keysAfter: ['a', 'b'], expected: 'b' },
  ])('prefers the box above, else below, when $name vanishes', ({ vanished, keysAfter, expected }) => {
    expect(ruleKeyAfterRemoval(['a', 'b', 'c'], vanished, keysAfter)).toBe(expected);
  });

  it('prefers the box above over the first box and the box below when the third of four vanishes', () => {
    expect(ruleKeyAfterRemoval(['a', 'b', 'c', 'd'], 'c', ['a', 'b', 'd'])).toBe('b');
  });

  it('skips a neighbour that vanished too and takes the nearest survivor above', () => {
    expect(ruleKeyAfterRemoval(['a', 'b', 'c', 'd', 'e'], 'd', ['a', 'b', 'e'])).toBe('b');
  });

  it('takes the nearest survivor below, not the first box now, when none above survives', () => {
    expect(ruleKeyAfterRemoval(['a', 'b', 'c', 'd', 'e'], 'b', ['x', 'd', 'e'])).toBe('d');
  });

  it('falls back to the first box now when every box it knew has gone but a new one is present', () => {
    expect(ruleKeyAfterRemoval(['a', 'b'], 'b', ['x'])).toBe('x');
  });

  it('returns null when no box is left', () => {
    expect(ruleKeyAfterRemoval(['a', 'b'], 'b', [])).toBeNull();
  });

  it('falls back to the first box now when the order before removal is unknown', () => {
    expect(ruleKeyAfterRemoval([], 'b', ['x', 'y'])).toBe('x');
  });
});

describe('bottomTierGroupsForCourse', () => {
  it('returns every bottom-tier group under the course, ordered by ordering then id', () => {
    const index = buildCompetencyCriteriaGroupsIndex(fixtureResponse);
    const groups = bottomTierGroupsForCourse(index, 'course-v1:OrgX+CS101+2024');
    expect(groups.map((g) => g.id)).toEqual([10, 11]); // group 10 has ordering 0, group 11 has ordering 1
  });

  it('orders by ordering rather than by id when the higher id has the lower ordering', () => {
    const index = buildCompetencyCriteriaGroupsIndex(reversedIdsResponse);
    const courseKey = 'course-v1:OrgX+CS101+2024';
    expect(bottomTierGroupsForCourse(index, courseKey).map((g) => g.id)).toEqual([30, 20]);
    expect(lastBottomTierGroupForCourse(index, courseKey)?.id).toEqual(20);
  });

  it('returns an empty array when the course has no course-level group', () => {
    const index = buildCompetencyCriteriaGroupsIndex(fixtureResponse);
    expect(bottomTierGroupsForCourse(index, 'course-v1:Unrelated+X+1')).toEqual([]);
  });
});

describe('lastBottomTierGroupForCourse', () => {
  it('returns the bottom-tier group with the highest ordering', () => {
    const index = buildCompetencyCriteriaGroupsIndex(fixtureResponse);
    const last = lastBottomTierGroupForCourse(index, 'course-v1:OrgX+CS101+2024');
    expect(last?.id).toEqual(11); // ordering 1, higher than group 10's ordering 0
  });

  it('breaks a tie in ordering by the higher id', () => {
    const tieResponse: CompetencyCriteriaTree = {
      groups: [
        {
          id: 1,
          parentId: 100,
          tagId: 42,
          courseKey: 'course-v1:OrgX+CS101+2024',
          name: 'course',
          ordering: 0,
          logicOperator: 'OR',
        },
        {
          id: 20,
          parentId: 1,
          tagId: 42,
          courseKey: null,
          name: 'leaf',
          ordering: 0,
          logicOperator: 'OR',
        },
        {
          id: 21,
          parentId: 1,
          tagId: 42,
          courseKey: null,
          name: 'leaf',
          ordering: 0,
          logicOperator: 'OR',
        },
      ],
      criteria: [],
    };
    const index = buildCompetencyCriteriaGroupsIndex(tieResponse);
    const last = lastBottomTierGroupForCourse(index, 'course-v1:OrgX+CS101+2024');
    expect(last?.id).toEqual(21);
  });

  it('returns null when the course has no course-level group', () => {
    const index = buildCompetencyCriteriaGroupsIndex(fixtureResponse);
    expect(lastBottomTierGroupForCourse(index, 'course-v1:Unrelated+X+1')).toBeNull();
  });

  it('returns null when the course-level group has no bottom-tier children yet', () => {
    const noChildrenResponse: CompetencyCriteriaTree = {
      groups: [
        {
          id: 1,
          parentId: 100,
          tagId: 42,
          courseKey: 'course-v1:OrgX+CS101+2024',
          name: 'course',
          ordering: 0,
          logicOperator: 'OR',
        },
      ],
      criteria: [],
    };
    const index = buildCompetencyCriteriaGroupsIndex(noChildrenResponse);
    expect(lastBottomTierGroupForCourse(index, 'course-v1:OrgX+CS101+2024')).toBeNull();
  });
});

describe('visibleCourseGroups', () => {
  it('returns a course-level group whose course is in accessibleCourseIds', () => {
    const index = buildCompetencyCriteriaGroupsIndex(fixtureResponse);
    expect(visibleCourseGroups(index, new Set(['course-v1:OrgX+CS101+2024']))).toEqual([fixtureResponse.groups[1]]);
  });

  it('excludes a course-level group whose course isn\'t in accessibleCourseIds', () => {
    const index = buildCompetencyCriteriaGroupsIndex(fixtureResponse);
    expect(visibleCourseGroups(index, new Set())).toEqual([]);
    expect(visibleCourseGroups(index, new Set(['course-v1:SomeOtherCourse+1']))).toEqual([]);
  });
});

describe('associatedObjectIds', () => {
  it('returns every criterion\'s objectId across the whole tree', () => {
    expect(associatedObjectIds(fixtureResponse)).toEqual(new Set(['block-a', 'block-b', 'block-d', 'block-c']));
  });
});

describe('isRuleTakenInGroup / nextUnusedScore', () => {
  const ruleOf = (op: GradeRulePayload['op'], percent: number, ruleType = 'grade') => ({
    ruleType,
    rulePayload: { op, value: percent / 100, scale: 'percent' as const },
  });
  const boxOf = (op: GradeRulePayload['op'], percent: number, ruleType = 'grade'): RuleBox => ({
    key: `${ruleType}:${op}:${percent}`,
    rule: ruleOf(op, percent, ruleType),
    criteria: [],
  });

  it('is taken when a box has the same rule type, operator, and rounded percent', () => {
    expect(isRuleTakenInGroup(ruleOf('gte', 75), [boxOf('gte', 75)])).toBe(true);
  });

  it('is not taken when only the operator differs', () => {
    expect(isRuleTakenInGroup(ruleOf('gte', 75), [boxOf('lte', 75)])).toBe(false);
  });

  it('is not taken when only the rule type differs', () => {
    expect(isRuleTakenInGroup(ruleOf('gte', 75), [boxOf('gte', 75, 'other')])).toBe(false);
  });

  it('does not count the box being edited as already using its own score', () => {
    const box = boxOf('gte', 75);
    expect(isRuleTakenInGroup(ruleOf('gte', 75), [box], box.key)).toBe(false);
  });

  it('suggests the next score up for gte', () => {
    expect(nextUnusedScore(ruleOf('gte', 75), [boxOf('gte', 75)])?.value).toBe(0.8);
  });

  it('suggests the next score down for lte', () => {
    expect(nextUnusedScore(ruleOf('lte', 40), [boxOf('lte', 40)])?.value).toBe(0.35);
  });

  it('skips scores that are also taken', () => {
    const boxes = [boxOf('gte', 75), boxOf('gte', 80)];
    expect(nextUnusedScore(ruleOf('gte', 75), boxes)?.value).toBe(0.85);
  });

  it('returns null when nothing is free in that direction', () => {
    const boxes = [boxOf('gte', 90), boxOf('gte', 95), boxOf('gte', 100)];
    expect(nextUnusedScore(ruleOf('gte', 90), boxes)).toBeNull();
  });

  it('returns null for an eq rule', () => {
    expect(nextUnusedScore(ruleOf('eq', 50), [boxOf('eq', 50)])).toBeNull();
  });
});

/** A tree of course-level groups (ids 1, 2, 3...), each with the given leaf group ids, in order. */
const buildTree = (courses: Array<{ id: number; ruleGroupIds: number[]; }>) => {
  const response: CompetencyCriteriaTree = {
    groups: [
      {
        id: 500,
        parentId: null,
        tagId: 42,
        courseKey: null,
        name: 'root',
        ordering: 0,
        logicOperator: 'AND',
      },
      ...courses.flatMap((course, courseOrdering) => [
        {
          id: course.id,
          parentId: 500,
          tagId: 42,
          courseKey: `course-v1:Org+C${course.id}+2024`,
          name: 'course',
          ordering: courseOrdering,
          logicOperator: 'AND' as const,
        },
        ...course.ruleGroupIds.map((ruleGroupId, ordering) => ({
          id: ruleGroupId,
          parentId: course.id,
          tagId: 42,
          courseKey: null,
          name: 'leaf',
          ordering,
          logicOperator: 'AND' as const,
        })),
      ]),
    ],
    criteria: [],
  };
  return buildCompetencyCriteriaGroupsIndex(response);
};

describe('snapshotPageOrder', () => {
  it('lists accessible course groups in their given order, each with its rule groups in ordering order', () => {
    const index = buildTree([{ id: 1, ruleGroupIds: [11, 10] }, { id: 2, ruleGroupIds: [20] }, {
      id: 3,
      ruleGroupIds: [30],
    }]);
    // `buildTree` assigns `ordering` by array position, so `[11, 10]` sorts 11 first. `accessible` is passed in reverse
    // on purpose, to show the snapshot keeps the given order.
    // Course group 3 is not accessible, so it is left out of what is rendered.
    const accessible = [index.courseGroups[1], index.courseGroups[0]];

    expect(snapshotPageOrder(index, accessible)).toEqual({
      entries: [
        { courseGroupId: 2, ruleGroupIds: [20] },
        { courseGroupId: 1, ruleGroupIds: [11, 10] },
      ],
      knownCourseGroupIds: [1, 2, 3],
    });
  });
});

const courseKeysOf = (index: CompetencyCriteriaGroupsIndex) =>
  new Set(index.courseGroups.map((item) => item.courseKey));

/** Treats every course group in `fresh` as accessible unless `accessibleCourseKeys` says otherwise. */
const targetAfterRemoval = (
  snapshot: PageOrderSnapshot,
  fresh: CompetencyCriteriaGroupsIndex,
  selection: Parameters<typeof selectionTargetAfterRemoval>[2],
  placeholderParentId: number | null,
  accessibleCourseKeys: ReadonlySet<string> = courseKeysOf(fresh),
) => selectionTargetAfterRemoval(snapshot, fresh, selection, placeholderParentId, accessibleCourseKeys);

describe('selectionTargetAfterRemoval', () => {
  // Course groups 1 (rule groups 10, 11, 12), 2 (20), 3 (30, 31), as rendered before a delete.
  const before = buildTree([
    { id: 1, ruleGroupIds: [10, 11, 12] },
    { id: 2, ruleGroupIds: [20] },
    { id: 3, ruleGroupIds: [30, 31] },
  ]);
  const snapshot = snapshotPageOrder(before, before.courseGroups);

  it('is unchanged when nothing was selected', () => {
    const fresh = buildTree([{ id: 1, ruleGroupIds: [10, 12] }]);
    expect(targetAfterRemoval(snapshot, fresh, null, null)).toBe('keep-current');
  });

  it.each([
    ['rule group', 'k'],
    ['placeholder rule box in a rule group', null],
  ])('is unchanged when the selected %s still exists', (_label, ruleKey) => {
    const fresh = buildTree([{ id: 1, ruleGroupIds: [10, 12] }, { id: 2, ruleGroupIds: [20] }, {
      id: 3,
      ruleGroupIds: [30, 31],
    }]);
    expect(targetAfterRemoval(snapshot, fresh, { groupId: 12, ruleKey }, null)).toBe('keep-current');
  });

  it('is unchanged for the placeholder rule group while its course group still exists', () => {
    const fresh = buildTree([{ id: 1, ruleGroupIds: [10, 11, 12] }]);
    expect(targetAfterRemoval(snapshot, fresh, { groupId: null, ruleKey: null }, 1)).toBe('keep-current');
  });

  it.each([
    ['a rule group', 'k'],
    ['a placeholder rule box in the rule group', null],
  ])('picks the nearest surviving rule group above when selection on %s was deleted', (_label, ruleKey) => {
    const fresh = buildTree([{ id: 1, ruleGroupIds: [10, 12] }, { id: 2, ruleGroupIds: [20] }, {
      id: 3,
      ruleGroupIds: [30, 31],
    }]);
    expect(targetAfterRemoval(snapshot, fresh, { groupId: 11, ruleKey }, null)).toBe(10);
  });

  it('skips an above neighbor that was also removed', () => {
    const fresh = buildTree([{ id: 1, ruleGroupIds: [10] }, { id: 2, ruleGroupIds: [20] }, {
      id: 3,
      ruleGroupIds: [30, 31],
    }]);
    expect(targetAfterRemoval(snapshot, fresh, { groupId: 12, ruleKey: 'k' }, null)).toBe(10);
  });

  it('picks the nearest surviving rule group below when the first one was deleted', () => {
    const fresh = buildTree([{ id: 1, ruleGroupIds: [11, 12] }, { id: 2, ruleGroupIds: [20] }, {
      id: 3,
      ruleGroupIds: [30, 31],
    }]);
    expect(targetAfterRemoval(snapshot, fresh, { groupId: 10, ruleKey: 'k' }, null)).toBe(11);
  });

  it('picks the last rule group of the surviving course group above when the course group cascaded away', () => {
    const fresh = buildTree([{ id: 1, ruleGroupIds: [10, 11, 12] }, { id: 3, ruleGroupIds: [30, 31] }]);
    expect(targetAfterRemoval(snapshot, fresh, { groupId: 20, ruleKey: 'k' }, null)).toBe(12);
  });

  it('picks the first rule group of the surviving course group below when none survives above', () => {
    const fresh = buildTree([{ id: 2, ruleGroupIds: [20] }, { id: 3, ruleGroupIds: [30, 31] }]);
    expect(targetAfterRemoval(snapshot, fresh, { groupId: 10, ruleKey: 'k' }, null)).toBe(20);
  });

  it('finds the nearest surviving course group when the placeholder rule group\'s own course group was deleted', () => {
    const fresh = buildTree([{ id: 1, ruleGroupIds: [10, 11, 12] }, { id: 3, ruleGroupIds: [30, 31] }]);
    expect(targetAfterRemoval(snapshot, fresh, { groupId: null, ruleKey: null }, 2)).toBe(12);
  });

  it('falls back to the first rule group of the first course group in the fresh data (another author\'s)', () => {
    const fresh = buildTree([{ id: 8, ruleGroupIds: [81, 80] }]);
    expect(targetAfterRemoval(snapshot, fresh, { groupId: 10, ruleKey: 'k' }, null)).toBe(81);
  });

  it('skips a course group that existed but was not rendered, since the author cannot see it', () => {
    const withHidden = buildTree([{ id: 1, ruleGroupIds: [10] }, { id: 4, ruleGroupIds: [40] }]);
    // Course group 4 existed but was not rendered.
    const hiddenSnapshot = snapshotPageOrder(withHidden, [withHidden.courseGroups[0]]);
    const fresh = buildTree([{ id: 4, ruleGroupIds: [40] }]);

    expect(targetAfterRemoval(hiddenSnapshot, fresh, { groupId: 10, ruleKey: 'k' }, null)).toBeNull();
  });

  it('picks a new course group past a hidden one that existed before', () => {
    const withHidden = buildTree([{ id: 1, ruleGroupIds: [10] }, { id: 4, ruleGroupIds: [40] }]);
    // Course group 4 existed but was not rendered.
    const hiddenSnapshot = snapshotPageOrder(withHidden, [withHidden.courseGroups[0]]);
    const fresh = buildTree([{ id: 4, ruleGroupIds: [40] }, { id: 8, ruleGroupIds: [80] }]);

    expect(targetAfterRemoval(hiddenSnapshot, fresh, { groupId: 10, ruleKey: 'k' }, null)).toBe(80);
  });

  it('skips a new course group whose course the author cannot access', () => {
    const fresh = buildTree([{ id: 8, ruleGroupIds: [80] }, { id: 9, ruleGroupIds: [90] }]);
    const accessibleCourseKeys = new Set([fresh.courseGroups[1].courseKey]);

    expect(targetAfterRemoval(snapshot, fresh, { groupId: 10, ruleKey: 'k' }, null, accessibleCourseKeys)).toBe(90);
  });

  it('is null when the only new course group is one the author cannot access', () => {
    const fresh = buildTree([{ id: 8, ruleGroupIds: [80] }]);

    expect(targetAfterRemoval(snapshot, fresh, { groupId: 10, ruleKey: 'k' }, null, new Set())).toBeNull();
  });

  it('is null when no course group with a rule group is left', () => {
    const fresh = buildTree([]);
    expect(targetAfterRemoval(snapshot, fresh, { groupId: 10, ruleKey: 'k' }, null)).toBeNull();
  });
});
