import type {
  CompetencyCriteriaGroupsResponse,
  CompetencyCriterion,
  CompetencyRuleProfile,
  GradeRulePayload,
} from './data/types';
import {
  associatedObjectIds,
  bottomTierGroupsForCourse,
  buildCompetencyCriteriaGroupsIndex,
  effectiveRuleOf,
  lastBottomTierGroupForCourse,
  lastRealRuleKeyIn,
  ruleBoxesForGroup,
  ruleKeyOf,
  visibleCourseGroups,
} from './utils';

const systemDefaultProfile: CompetencyRuleProfile = {
  id: 1,
  ruleType: 'grade',
  rulePayload: { op: 'gte', value: 0.7, scale: 'percent' },
};

const buildCriterion = (overrides: Partial<CompetencyCriterion> = {}): CompetencyCriterion => ({
  id: 1,
  objectId: 'block-a',
  competencyCriteriaGroupId: 10,
  ruleProfileId: null,
  ruleTypeOverride: null,
  rulePayloadOverride: null,
  ...overrides,
});

// One course (id 1, "course-v1:OrgX+CS101+2024") with two bottom-tier
// groups: group 10 (ordering 0) holds two rule boxes (criteria 101+102
// share the default profile's rule, criterion 104 overrides to a
// different one); group 11 (ordering 1) holds one rule box (criterion
// 103). Group ids and array order are deliberately out of numeric/array
// order so tests can't pass by accident from iterating in id or array
// order instead of by the fields the derivation actually sorts on.
const fixtureResponse: CompetencyCriteriaGroupsResponse = {
  groups: [
    {
      id: 1,
      parentId: null,
      depth: 1,
      ordering: 0,
      logicOperator: 'and',
      courseKey: 'course-v1:OrgX+CS101+2024',
    },
    { id: 11, parentId: 1, depth: 2, ordering: 1, logicOperator: 'or' },
    { id: 10, parentId: 1, depth: 2, ordering: 0, logicOperator: 'and' },
  ],
  criteria: [
    buildCriterion({
      id: 101,
      objectId: 'block-a',
      competencyCriteriaGroupId: 10,
      ruleTypeOverride: 'grade',
      rulePayloadOverride: { op: 'gte', value: 0.7, scale: 'percent' },
    }),
    // No override: resolves through `systemDefaultProfile`, which happens
    // to carry the exact same rule as criterion 101's override above - so
    // this criterion must land in the *same* rule box as 101.
    buildCriterion({ id: 102, objectId: 'block-b', competencyCriteriaGroupId: 10 }),
    buildCriterion({
      id: 104,
      objectId: 'block-d',
      competencyCriteriaGroupId: 10,
      ruleTypeOverride: 'grade',
      rulePayloadOverride: { op: 'lte', value: 0.9, scale: 'percent' },
    }),
    buildCriterion({
      id: 103,
      objectId: 'block-c',
      competencyCriteriaGroupId: 11,
      ruleTypeOverride: 'grade',
      rulePayloadOverride: { op: 'lte', value: 0.5, scale: 'percent' },
    }),
  ],
};

describe('buildCompetencyCriteriaGroupsIndex', () => {
  it('indexes groups by id, by parent, and criteria by containing group', () => {
    const index = buildCompetencyCriteriaGroupsIndex(fixtureResponse);

    expect(index.groupsById.get(10)).toEqual(fixtureResponse.groups[2]);
    expect(index.groupsById.get(11)).toEqual(fixtureResponse.groups[1]);
    expect(index.groupsById.get(1)).toEqual(fixtureResponse.groups[0]);

    const childrenOfCourseGroup = index.childGroupsByParentId.get(1) ?? [];
    expect(childrenOfCourseGroup.map((g) => g.id).sort()).toEqual([10, 11]);
    expect(index.childGroupsByParentId.get(10)).toBeUndefined();

    expect((index.criteriaByGroupId.get(10) ?? []).map((c) => c.id).sort()).toEqual([101, 102, 104]);
    expect((index.criteriaByGroupId.get(11) ?? []).map((c) => c.id)).toEqual([103]);

    expect(index.courseGroups).toEqual([fixtureResponse.groups[0]]);
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
    // Sorted by lowest criterion id ascending: the 101/102 box (min id
    // 101) comes before the 104 box (min id 104).
    expect(boxes[0].criteria.map((c) => c.id).sort()).toEqual([101, 102]);
    expect(boxes[0].rule).toEqual({ ruleType: 'grade', rulePayload: { op: 'gte', value: 0.7, scale: 'percent' } });
    expect(boxes[1].criteria.map((c) => c.id)).toEqual([104]);
    expect(boxes[1].rule).toEqual({ ruleType: 'grade', rulePayload: { op: 'lte', value: 0.9, scale: 'percent' } });
  });

  it('returns no boxes for a group with no criteria', () => {
    const index = buildCompetencyCriteriaGroupsIndex(fixtureResponse);
    expect(ruleBoxesForGroup(999, index, systemDefaultProfile)).toEqual([]);
  });
});

describe('lastRealRuleKeyIn', () => {
  it('returns the last box\'s rule key for a populated group', () => {
    const index = buildCompetencyCriteriaGroupsIndex(fixtureResponse);
    expect(lastRealRuleKeyIn(10, index, systemDefaultProfile)).toEqual(ruleKeyOf(
      buildCriterion({
        id: 104,
        ruleTypeOverride: 'grade',
        rulePayloadOverride: { op: 'lte', value: 0.9, scale: 'percent' },
      }),
      systemDefaultProfile,
    ));
  });

  it('returns null for a group with no criteria', () => {
    const index = buildCompetencyCriteriaGroupsIndex(fixtureResponse);
    expect(lastRealRuleKeyIn(999, index, systemDefaultProfile)).toBeNull();
  });
});

describe('bottomTierGroupsForCourse', () => {
  it('returns every bottom-tier group under the course, ordered by ordering then id', () => {
    const index = buildCompetencyCriteriaGroupsIndex(fixtureResponse);
    const groups = bottomTierGroupsForCourse(index, 'course-v1:OrgX+CS101+2024');
    expect(groups.map((g) => g.id)).toEqual([10, 11]); // group 10 has ordering 0, group 11 has ordering 1
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
    const tieResponse: CompetencyCriteriaGroupsResponse = {
      groups: [
        {
          id: 1,
          parentId: null,
          depth: 1,
          ordering: 0,
          logicOperator: 'and',
          courseKey: 'course-v1:OrgX+CS101+2024',
        },
        { id: 20, parentId: 1, depth: 2, ordering: 0, logicOperator: 'and' },
        { id: 21, parentId: 1, depth: 2, ordering: 0, logicOperator: 'and' },
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
    const noChildrenResponse: CompetencyCriteriaGroupsResponse = {
      groups: [
        {
          id: 1,
          parentId: null,
          depth: 1,
          ordering: 0,
          logicOperator: 'and',
          courseKey: 'course-v1:OrgX+CS101+2024',
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
    expect(visibleCourseGroups(index, new Set(['course-v1:OrgX+CS101+2024']))).toEqual([fixtureResponse.groups[0]]);
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
