import type {
  BottomTierCompetencyCriteriaGroup,
  CompetencyCriteriaGroup,
  CompetencyCriteriaGroupsResponse,
  CompetencyCriterion,
  CompetencyRuleProfile,
  CourseCompetencyCriteriaGroup,
  EffectiveRule,
  RuleBox,
} from './data/types';

/** An indexed view over `#681`'s flat `groups`/`criteria` arrays, built
 * once per response by `buildCompetencyCriteriaGroupsIndex` so every other
 * derivation in this file can do O(1) lookups instead of re-scanning the
 * flat arrays.
 */
export interface CompetencyCriteriaGroupsIndex {
  /** Every group (root, course-level, or leaf), keyed by its own id. */
  groupsById: Map<number, CompetencyCriteriaGroup>;
  /** Every group's direct children, keyed by parent id. The root's
   * children are course-level groups; a course-level group's children are
   * its leaf (bottom-tier) groups; a leaf group has no entry here (it has
   * no children).
   */
  childGroupsByParentId: Map<number, CompetencyCriteriaGroup[]>;
  /** Every criterion belonging to one leaf group, keyed by that group's id. */
  criteriaByGroupId: Map<number, CompetencyCriterion[]>;
  /** Every course-level group (`courseKey !== null`), in the order the API
   * returned them.
   */
  courseGroups: CourseCompetencyCriteriaGroup[];
}

/** Indexes `#681`'s flat `groups`/`criteria` response for lookup by id,
 * parent, and containing group - the shape every other function in this
 * file operates on.
 */
export function buildCompetencyCriteriaGroupsIndex(
  response: CompetencyCriteriaGroupsResponse,
): CompetencyCriteriaGroupsIndex {
  const groupsById = new Map<number, CompetencyCriteriaGroup>();
  const childGroupsByParentId = new Map<number, CompetencyCriteriaGroup[]>();
  const courseGroups: CourseCompetencyCriteriaGroup[] = [];

  response.groups.forEach((group) => {
    groupsById.set(group.id, group);
    if (group.courseKey !== null) {
      courseGroups.push(group as CourseCompetencyCriteriaGroup);
    }
    if (group.parentId !== null) {
      const siblings = childGroupsByParentId.get(group.parentId) ?? [];
      siblings.push(group);
      childGroupsByParentId.set(group.parentId, siblings);
    }
  });

  const criteriaByGroupId = new Map<number, CompetencyCriterion[]>();
  response.criteria.forEach((criterion) => {
    const siblings = criteriaByGroupId.get(criterion.groupId) ?? [];
    siblings.push(criterion);
    criteriaByGroupId.set(criterion.groupId, siblings);
  });

  return {
    groupsById,
    childGroupsByParentId,
    criteriaByGroupId,
    courseGroups,
  };
}

/** The rule that actually governs a criterion: its own override fields
 * when set, otherwise the system default rule profile's rule. ADR 0002
 * guarantees a criterion carries exactly one of {a shared rule-profile
 * reference} or {both override fields}, never both, never neither.
 */
export function effectiveRuleOf(
  criterion: Pick<CompetencyCriterion, 'ruleTypeOverride' | 'rulePayloadOverride'>,
  systemDefaultProfile: CompetencyRuleProfile,
): EffectiveRule {
  if (criterion.ruleTypeOverride !== null && criterion.rulePayloadOverride !== null) {
    return { ruleType: criterion.ruleTypeOverride, rulePayload: criterion.rulePayloadOverride };
  }
  return { ruleType: systemDefaultProfile.ruleType, rulePayload: systemDefaultProfile.rulePayload };
}

/** A stable key for a criterion's effective rule, built from the rule's
 * own fixed-order fields - never `JSON.stringify`ing the payload object,
 * since an object's own key-insertion order isn't guaranteed stable across
 * two otherwise-identical payloads (e.g. one built by the API client, one
 * reconstructed from a form).
 */
export function ruleKeyOf(
  criterion: Pick<CompetencyCriterion, 'ruleTypeOverride' | 'rulePayloadOverride'>,
  systemDefaultProfile: CompetencyRuleProfile,
): string {
  const { ruleType, rulePayload } = effectiveRuleOf(criterion, systemDefaultProfile);
  const { op, value, scale } = rulePayload;
  return `${ruleType}:${op}:${value}:${scale}`;
}

/** Groups one leaf group's criteria into rule boxes by
 * `ruleKeyOf` - criteria sharing the same effective rule render as a
 * single box. Boxes are ordered by their lowest criterion `id` ascending,
 * rule key as a tie-break.
 */
export function ruleBoxesForGroup(
  groupId: number,
  index: CompetencyCriteriaGroupsIndex,
  systemDefaultProfile: CompetencyRuleProfile,
): RuleBox[] {
  const criteria = index.criteriaByGroupId.get(groupId) ?? [];
  const criteriaByKey = new Map<string, CompetencyCriterion[]>();
  criteria.forEach((criterion) => {
    const key = ruleKeyOf(criterion, systemDefaultProfile);
    const box = criteriaByKey.get(key) ?? [];
    box.push(criterion);
    criteriaByKey.set(key, box);
  });

  return Array.from(criteriaByKey.entries())
    .map(([key, boxCriteria]): RuleBox => ({
      key,
      rule: effectiveRuleOf(boxCriteria[0], systemDefaultProfile),
      criteria: boxCriteria,
    }))
    .sort((a, b) => {
      const aMinId = Math.min(...a.criteria.map((c) => c.id));
      const bMinId = Math.min(...b.criteria.map((c) => c.id));
      return (aMinId - bMinId) || a.key.localeCompare(b.key);
    });
}

/** The rule key of a bottom-tier group's last rule box (the one with the
 * highest lowest-criterion-id, i.e. the most recently added), or `null` if
 * the group has no criteria yet.
 */
export function lastRealRuleKeyIn(
  groupId: number,
  index: CompetencyCriteriaGroupsIndex,
  systemDefaultProfile: CompetencyRuleProfile,
): string | null {
  const boxes = ruleBoxesForGroup(groupId, index, systemDefaultProfile);
  return boxes.length ? boxes[boxes.length - 1].key : null;
}

/** Every bottom-tier group under the course-level group for the given
 * course, ordered per ADR 0002's `ordering` field ascending, `id` as
 * tie-break - the order `CourseGroupSection` renders its group cards in.
 * Empty if that course has no course-level group yet, or that group has no
 * bottom-tier children yet.
 */
export function bottomTierGroupsForCourse(
  index: CompetencyCriteriaGroupsIndex,
  courseId: string,
): BottomTierCompetencyCriteriaGroup[] {
  const courseGroup = index.courseGroups.find((group) => group.courseKey === courseId);
  if (!courseGroup) {
    return [];
  }
  const children = (index.childGroupsByParentId.get(courseGroup.id) ?? []) as BottomTierCompetencyCriteriaGroup[];
  return [...children].sort((a, b) => (a.ordering - b.ordering) || (a.id - b.id));
}

/** The last group in `bottomTierGroupsForCourse`'s order, or `null` if
 * that course has no course-level group yet, or that group has no
 * bottom-tier children yet.
 */
export function lastBottomTierGroupForCourse(
  index: CompetencyCriteriaGroupsIndex,
  courseId: string,
): BottomTierCompetencyCriteriaGroup | null {
  const sorted = bottomTierGroupsForCourse(index, courseId);
  return sorted.length ? sorted[sorted.length - 1] : null;
}

/** Every course-level group whose own course the author can actually see.
 *
 * `index.courseGroups` alone isn't enough: the response can carry an
 * association for a course the content-search lookup doesn't return for
 * this author, which must never render, not even with a placeholder name.
 * `accessibleCourseIds` is `CompetencyAssociationsContext`'s own answer to
 * whether a course's outline fetch resolved successfully; this file has no
 * fetch of its own, so the caller supplies that answer.
 */
export function visibleCourseGroups(
  index: CompetencyCriteriaGroupsIndex,
  accessibleCourseIds: Set<string>,
): CourseCompetencyCriteriaGroup[] {
  return index.courseGroups.filter((courseGroup) => accessibleCourseIds.has(courseGroup.courseKey));
}

/** Every criterion's `objectId` across the whole response, as a set - the
 * create mutation's duplicate guard uses this to tell whether a clicked
 * subsection already has a criterion associated with it.
 */
export function associatedObjectIds(response: CompetencyCriteriaGroupsResponse): Set<string> {
  return new Set(response.criteria.map((criterion) => criterion.objectId));
}
