import type {
  CompetencyCriteriaGroup,
  CompetencyCriteriaGroupsResponse,
  CompetencyCriterion,
  GradeRulePayload,
} from '../data/types';

export const tagId = 42;
export const courseA = 'course-v1:OrgX+CS101+2024';
export const courseB = 'course-v1:OrgX+CS102+2024';
export const courseOther = 'course-v1:OrgX+CS999+2024';

export const gteRule: GradeRulePayload = { op: 'gte', value: 0.7, scale: 'percent' };
export const eqRule: GradeRulePayload = { op: 'eq', value: 1, scale: 'percent' };

export const group = (
  id: number,
  parentId: number | null,
  courseKey: string | null,
  ordering: number,
  overrides: Partial<CompetencyCriteriaGroup> = {},
): CompetencyCriteriaGroup => ({
  id,
  parentId,
  tagId,
  courseKey,
  name: 'group',
  ordering,
  logicOperator: 'OR',
  ...overrides,
});

/** A criterion governed by the default profile unless `overrides` sets its own rule. */
export const criterion = (
  id: number,
  objectId: string,
  groupId: number,
  overrides: Partial<CompetencyCriterion> = {},
): CompetencyCriterion => ({
  id,
  objectId,
  groupId,
  ruleProfileId: 1,
  ruleTypeOverride: null,
  rulePayloadOverride: null,
  ...overrides,
});

/** The default-profile endpoint's wire format: snake_case, paginated. */
export const defaultProfileResponse = {
  count: 1,
  next: null,
  previous: null,
  results: [
    {
      id: 1,
      scope_type: 'system_default',
      rule_type: 'grade',
      rule_payload: gteRule,
      archived: false,
    },
  ],
};

const rootGroup = group(500, null, null, 0);
const courseAGroup = group(1, 500, courseA, 0);
const courseBGroup = group(2, 500, courseB, 1);

/** Course A with its only leaf group (10) holding one criterion. */
export const singleGroupResponse: CompetencyCriteriaGroupsResponse = {
  groups: [rootGroup, courseAGroup, group(10, 1, null, 0)],
  criteria: [criterion(900, 'existing-sub', 10)],
};

/** Course A with two leaf groups (10 and 11). */
export const twoGroupsResponse: CompetencyCriteriaGroupsResponse = {
  groups: [rootGroup, courseAGroup, group(10, 1, null, 0), group(11, 1, null, 1)],
  criteria: [],
};

export const noGroupsResponse: CompetencyCriteriaGroupsResponse = { groups: [], criteria: [] };

/** Course A (leaf 10) and course B (leaf 20). */
export const twoCoursesResponse: CompetencyCriteriaGroupsResponse = {
  groups: [rootGroup, courseAGroup, group(10, 1, null, 0), courseBGroup, group(20, 2, null, 0)],
  criteria: [],
};

/** Course A (leaf 10) and course B with leaves 21 (ordering 1) and 20 (ordering 0), listed
 * out of order. Group 21 is course B's last group and its last rule box is the `eq` override.
 */
export const courseBGroupsResponse: CompetencyCriteriaGroupsResponse = {
  groups: [
    rootGroup,
    courseAGroup,
    group(10, 1, null, 0),
    courseBGroup,
    group(21, 2, null, 1),
    group(20, 2, null, 0),
  ],
  criteria: [
    criterion(910, 'b-sub-1', 21),
    criterion(911, 'b-sub-2', 21, {
      ruleProfileId: null,
      ruleTypeOverride: 'grade',
      rulePayloadOverride: eqRule,
    }),
  ],
};

/** `singleGroupResponse` with its leaf renamed to 30, so switching between the
 * two competencies changes which group is auto-focused.
 */
export const otherSingleGroupResponse: CompetencyCriteriaGroupsResponse = {
  groups: singleGroupResponse.groups.map((item) => (item.id === 10 ? { ...item, id: 30 } : item)),
  criteria: [],
};
