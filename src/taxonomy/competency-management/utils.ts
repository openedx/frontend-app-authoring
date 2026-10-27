import type {
  BottomTierCompetencyCriteriaGroup,
  CompetencyCriteriaGroup,
  CompetencyCriteriaTree,
  CompetencyCriterion,
  CompetencyRuleProfile,
  CourseCompetencyCriteriaGroup,
  EffectiveRule,
  GradeRulePayload,
  RuleBox,
} from './data/types';

/** Lookup maps over a response's flat `groups` and `criteria` arrays. */
export interface CompetencyCriteriaGroupsIndex {
  /** Every group (root, course-level, or leaf), keyed by its own id. */
  groupsById: Map<number, CompetencyCriteriaGroup>;
  /** Every group's direct children, keyed by parent id. Leaf groups have no entry. */
  childGroupsByParentId: Map<number, CompetencyCriteriaGroup[]>;
  /** Every criterion belonging to one leaf group, keyed by that group's id. */
  criteriaByGroupId: Map<number, CompetencyCriterion[]>;
  /** Every course-level group, in the order the API returned them. */
  courseGroups: CourseCompetencyCriteriaGroup[];
}

export function buildCompetencyCriteriaGroupsIndex(
  response: CompetencyCriteriaTree,
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

/** The rule that governs a criterion: its own override fields when set, otherwise the system default rule. */
export function effectiveRuleOf(
  criterion: Pick<CompetencyCriterion, 'ruleTypeOverride' | 'rulePayloadOverride'>,
  systemDefaultProfile: CompetencyRuleProfile,
): EffectiveRule {
  if (criterion.ruleTypeOverride !== null && criterion.rulePayloadOverride !== null) {
    return { ruleType: criterion.ruleTypeOverride, rulePayload: criterion.rulePayloadOverride };
  }
  return { ruleType: systemDefaultProfile.ruleType, rulePayload: systemDefaultProfile.rulePayload };
}

/** A stable key for a criterion's effective rule. It is built from fixed-order fields, not
 * `JSON.stringify`, because key order can differ between two otherwise identical payloads.
 */
export function ruleKeyOf(
  criterion: Pick<CompetencyCriterion, 'ruleTypeOverride' | 'rulePayloadOverride'>,
  systemDefaultProfile: CompetencyRuleProfile,
): string {
  const { ruleType, rulePayload } = effectiveRuleOf(criterion, systemDefaultProfile);
  const { op, value, scale } = rulePayload;
  return `${ruleType}:${op}:${value}:${scale}`;
}

/** Groups one leaf group's criteria into rule boxes by effective rule, ordered by lowest criterion `id`. */
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

const percentOf = (rulePayload: GradeRulePayload): number => Math.round(rulePayload.value * 100);

/** Whether two grade payloads have the same operator, scale, and rounded percent. */
export const isSameRulePayload = (a: GradeRulePayload, b: GradeRulePayload): boolean => (
  a.op === b.op && a.scale === b.scale && percentOf(a) === percentOf(b)
);

/** Whether a rule box with the same rule type, operator, and rounded percent
 * already exists. Compares percents rather than `ruleKeyOf`'s raw-fraction
 * key, which could differ by formatting alone. `excludeKey` skips the box
 * being edited.
 */
export function isRuleTakenInGroup(rule: EffectiveRule, boxes: RuleBox[], excludeKey?: string): boolean {
  return boxes.some((box) => (
    box.key !== excludeKey
    && box.rule.ruleType === rule.ruleType
    && isSameRulePayload(box.rule.rulePayload, rule.rulePayload)
  ));
}

const SUGGESTED_SCORE_STEP = 5;

/** The nearest unused score in steps of 5, moving stricter: `gte` up, `lte`
 * down, within 0-100. `null` for `eq` or when nothing is free.
 */
export function nextUnusedScore(rule: EffectiveRule, boxes: RuleBox[]): GradeRulePayload | null {
  const { op } = rule.rulePayload;
  if (op === 'eq') {
    return null;
  }
  const direction = op === 'gte' ? SUGGESTED_SCORE_STEP : -SUGGESTED_SCORE_STEP;
  for (let percent = percentOf(rule.rulePayload) + direction; percent >= 0 && percent <= 100; percent += direction) {
    const candidate: EffectiveRule = { ...rule, rulePayload: { ...rule.rulePayload, value: percent / 100 } };
    if (!isRuleTakenInGroup(candidate, boxes)) {
      return candidate.rulePayload;
    }
  }
  return null;
}

/** The key of a bottom-tier group's last rule box, or `null` if the group has no criteria. */
export function lastRuleKeyIn(
  groupId: number,
  index: CompetencyCriteriaGroupsIndex,
  systemDefaultProfile: CompetencyRuleProfile,
): string | null {
  const boxes = ruleBoxesForGroup(groupId, index, systemDefaultProfile);
  return boxes.length ? boxes[boxes.length - 1].key : null;
}

/** The rule box to focus once the focused `vanishedKey` is gone from a surviving group: the nearest survivor above
 * it in `keysBefore`, else the nearest below, else the first of `keysAfter`, else `null`.
 */
export function ruleKeyAfterRemoval(keysBefore: string[], vanishedKey: string, keysAfter: string[]): string | null {
  const survives = (key: string) => keysAfter.includes(key);
  const position = keysBefore.indexOf(vanishedKey);
  const above = position === -1 ? undefined : keysBefore.slice(0, position).filter(survives).pop();
  const below = position === -1 ? undefined : keysBefore.slice(position + 1).find(survives);
  return above ?? below ?? keysAfter[0] ?? null;
}

/** The bottom-tier groups of one course, ordered by `ordering` then `id`. Empty if the course has none. */
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

/** The last group in `bottomTierGroupsForCourse`'s order, or `null` if the course has none. */
export function lastBottomTierGroupForCourse(
  index: CompetencyCriteriaGroupsIndex,
  courseId: string,
): BottomTierCompetencyCriteriaGroup | null {
  const sorted = bottomTierGroupsForCourse(index, courseId);
  return sorted.length ? sorted[sorted.length - 1] : null;
}

/** The course-level groups whose course the author can see. The response can include courses
 * the author has no access to, and those must not render.
 */
export function visibleCourseGroups(
  index: CompetencyCriteriaGroupsIndex,
  accessibleCourseIds: ReadonlySet<string>,
): CourseCompetencyCriteriaGroup[] {
  return index.courseGroups.filter((courseGroup) => accessibleCourseIds.has(courseGroup.courseKey));
}

export function associatedObjectIds(response: CompetencyCriteriaTree): Set<string> {
  return new Set(response.criteria.map((criterion) => criterion.objectId));
}

/** One course-level group and its bottom-tier groups, as rendered. */
export interface PageOrderEntry {
  courseGroupId: number;
  ruleGroupIds: number[];
}

/** The rendered group order, captured before a delete to locate the removed selection afterward. */
export interface PageOrderSnapshot {
  /** What was rendered: the accessible course-level groups only. */
  entries: PageOrderEntry[];
  /** Every course-level group that existed. One missing from `entries` is inaccessible. */
  knownCourseGroupIds: number[];
}

/** Captures the group order for `selectionTargetAfterRemoval`, which locates a deleted group's neighbors in it. It
 * must match what `CourseGroupList` renders: the accessible course-level groups in the given order, each with its
 * bottom-tier groups sorted by `ordering`, then `id`.
 */
export function snapshotPageOrder(
  index: CompetencyCriteriaGroupsIndex,
  accessibleCourseGroups: CourseCompetencyCriteriaGroup[],
): PageOrderSnapshot {
  return {
    entries: accessibleCourseGroups.map((courseGroup) => ({
      courseGroupId: courseGroup.id,
      ruleGroupIds: bottomTierGroupsForCourse(index, courseGroup.courseKey).map((group) => group.id),
    })),
    knownCourseGroupIds: index.courseGroups.map((courseGroup) => courseGroup.id),
  };
}

type Survives = (id: number) => boolean;
type SelectionRef = { groupId: number | null; ruleKey: string | null; };

function selectionSurvives(selection: SelectionRef, placeholderParentId: number | null, survives: Survives): boolean {
  if (selection.groupId === null) {
    return placeholderParentId === null || survives(placeholderParentId);
  }
  return survives(selection.groupId);
}

function courseEntryPositionOf(
  snapshot: PageOrderSnapshot,
  selection: SelectionRef,
  placeholderParentId: number | null,
): number {
  const { groupId } = selection;
  return groupId === null
    ? snapshot.entries.findIndex((entry) => entry.courseGroupId === placeholderParentId)
    : snapshot.entries.findIndex((entry) => entry.ruleGroupIds.includes(groupId));
}

/** The nearest surviving rule group above the selected one in its course-level group, else the nearest below. */
function nearestInCourseGroup(entry: PageOrderEntry, selectedGroupId: number | null, survives: Survives) {
  if (selectedGroupId === null) {
    return undefined;
  }
  const position = entry.ruleGroupIds.indexOf(selectedGroupId);
  const nearestAbove = entry.ruleGroupIds.slice(0, position).filter(survives).at(-1);
  return nearestAbove ?? entry.ruleGroupIds.slice(position + 1).find(survives);
}

// Flattened across course-level groups, the last survivor is the last group of the nearest course group above that
// has one.
function lastGroupOfCourseAbove(snapshot: PageOrderSnapshot, position: number, survives: Survives) {
  return snapshot.entries.slice(0, position).flatMap((entry) => entry.ruleGroupIds).filter(survives).at(-1);
}

function firstGroupOfCourseBelow(snapshot: PageOrderSnapshot, position: number, survives: Survives) {
  return snapshot.entries.slice(position + 1).flatMap((entry) => entry.ruleGroupIds).find(survives);
}

// A course-level group that existed at the snapshot is either covered by the rules above or inaccessible to the
// author, so only a new, accessible one can hold a visible target.
export function firstGroupOfNewCourse(
  snapshot: PageOrderSnapshot,
  freshIndex: CompetencyCriteriaGroupsIndex,
  accessibleCourseKeys: ReadonlySet<string>,
) {
  return visibleCourseGroups(freshIndex, accessibleCourseKeys)
    .filter((courseGroup) => !snapshot.knownCourseGroupIds.includes(courseGroup.id))
    .map((courseGroup) => bottomTierGroupsForCourse(freshIndex, courseGroup.courseKey)[0]?.id)
    .find((id) => id !== undefined);
}

/** Where selection goes after a delete, given the page order from before it and
 * the refetched data. Returns the id of the bottom-tier group to select,
 * `'keep-current'` when selection needs no move, or `null` when nothing is left to
 * select. In order:
 *
 * 1. Nothing is selected, or the selected group still exists (for the placeholder
 *    group, its course-level group still exists or it has no parent): `'keep-current'`.
 * 2. Its course-level group survives: the nearest surviving group above it
 *    in the snapshot, else the nearest below.
 * 3. Otherwise the last group of the nearest surviving course-level group
 *    above, else the first group of the nearest one below.
 * 4. Otherwise the first group of the first course-level group in
 *    `freshIndex` that has one, did not exist at the snapshot (another
 *    author may have added it), and whose course is in `accessibleCourseKeys`.
 * 5. Otherwise `null`.
 *
 * Rules 2 and 3 apply only when the selected group is in `snapshot.entries`, and a surviving course-level group is
 * one with a surviving rule group. A placeholder rule box (`ruleKey === null` with a real `groupId`) counts as a
 * selection of its group.
 */
export function selectionTargetAfterRemoval(
  snapshot: PageOrderSnapshot,
  freshIndex: CompetencyCriteriaGroupsIndex,
  selection: SelectionRef | null,
  placeholderParentId: number | null,
  accessibleCourseKeys: ReadonlySet<string>,
): number | 'keep-current' | null {
  const survives: Survives = (id) => freshIndex.groupsById.has(id);
  if (selection === null || selectionSurvives(selection, placeholderParentId, survives)) {
    return 'keep-current';
  }
  const position = courseEntryPositionOf(snapshot, selection, placeholderParentId);
  const inKnownCourse = position === -1
    ? undefined
    : nearestInCourseGroup(snapshot.entries[position], selection.groupId, survives)
      ?? lastGroupOfCourseAbove(snapshot, position, survives)
      ?? firstGroupOfCourseBelow(snapshot, position, survives);
  return inKnownCourse ?? firstGroupOfNewCourse(snapshot, freshIndex, accessibleCourseKeys) ?? null;
}
