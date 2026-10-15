/** How a group's immediate children combine: "AND" (all) or "OR" (any). */
export type CompetencyGroupLogicOperator = 'AND' | 'OR';

/** One criteria-group row of a competency's three-level tree. The API has no
 * `depth` field, so a group's level is inferred from `parentId`/`courseKey`:
 * - root: `parentId: null`, `courseKey: null`. One per competency. Never rendered.
 * - course-level: `parentId` is the root's id, `courseKey` is set. One per
 *   course this competency has criteria in.
 * - leaf ("bottom-tier"): `parentId` is a course-level group's id,
 *   `courseKey: null`. Holds criteria directly.
 */
export interface CompetencyCriteriaGroup {
  id: number;
  parentId: number | null;
  tagId: number;
  courseKey: string | null;
  name: string;
  /** Sibling ordering within the same parent, ascending. */
  ordering: number;
  logicOperator: CompetencyGroupLogicOperator;
}

/** A course-level group: `courseKey` is set. */
export interface CourseCompetencyCriteriaGroup extends CompetencyCriteriaGroup {
  courseKey: string;
}

/** A leaf ("bottom-tier") group: `courseKey` is `null`. */
export interface BottomTierCompetencyCriteriaGroup extends CompetencyCriteriaGroup {
  courseKey: null;
}

/** The payload of the "Grade" rule, the only rule type supported today. */
export interface GradeRulePayload {
  op: 'gte' | 'lte' | 'eq';
  /** A 0.0-1.0 fraction, not a 0-100 percentage. */
  value: number;
  scale: 'percent';
}

/** A group's persisted association to one piece of course content (a
 * gradable subsection, per the MVP scope). It carries either a
 * `ruleProfileId` alone or both override fields together, never both
 * and never neither.
 */
export interface CompetencyCriterion {
  id: number;
  /** The associated content object's id (e.g. a subsection's usage key). */
  objectId: string;
  /** The leaf (bottom-tier) group this criterion belongs to. */
  groupId: number;
  ruleProfileId: number | null;
  ruleTypeOverride: string | null;
  rulePayloadOverride: GradeRulePayload | null;
}

/** A flat `groups` array (root, course-level, and leaf rows mixed) plus a
 * flat `criteria` array, each criterion pointing at its leaf group by id.
 */
export interface CompetencyCriteriaGroupsResponse {
  groups: CompetencyCriteriaGroup[];
  criteria: CompetencyCriterion[];
}

export interface CompetencyRuleProfile {
  id: number;
  /** `'system_default'`, `'taxonomy'`, `'course'`, or `'organization'`. Only
   * `'system_default'` is used today.
   */
  scopeType: string;
  ruleType: string;
  rulePayload: GradeRulePayload;
  archived: boolean;
}

/** A standard DRF paginated list: pick the row you need out of `results`. */
export interface CompetencyRuleProfileListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: CompetencyRuleProfile[];
}

/** The rule that governs a criterion: its own override when set, otherwise
 * the system default profile's rule.
 */
export interface EffectiveRule {
  ruleType: string;
  rulePayload: GradeRulePayload;
}

/** The criteria of one leaf group that share an effective rule, shown as a
 * single box. A rule box is not stored, so it has no id.
 */
export interface RuleBox {
  /** The effective rule serialized as `ruleType:op:value:scale`, for example
   * `grade:gte:0.7:percent`. It is what `focus.ruleKey` points at.
   */
  key: string;
  rule: EffectiveRule;
  criteria: CompetencyCriterion[];
}

/** Request body for creating a criterion. Snake_case, unlike the camelCased response types. */
export interface CreateCompetencyCriterionPayload {
  object_id: string;
  group_id?: number;
  rule_type_override?: string;
  rule_payload_override?: GradeRulePayload;
}

/** `createCompetencyCriterion`'s 201 response: no `objectId` (write-only on
 * the create endpoint), plus `objectTagId`, the id of the object-tag row
 * linking the content object to the competency.
 */
export type CreateCompetencyCriterionResponse = Omit<CompetencyCriterion, 'objectId'> & { objectTagId: number; };

/** Request body for updating a bottom-tier group's any/all combining logic (`#760`): just
 * `logic_operator`, under its own wire key. */
export interface UpdateCompetencyCriteriaGroupPayload {
  logic_operator: CompetencyGroupLogicOperator;
}

/** Request body for updating a rule box's score threshold (`#759`), batched
 * across every criterion that currently shares the box. Always carries
 * explicit override values, never a `competency_rule_profile_id` - the
 * backend reassigns a criterion back to its default profile itself when
 * the submitted value matches it, so "reset to default" needs no special
 * payload here.
 */
export interface UpdateCompetencyCriteriaRulePayload {
  criterion_ids: number[];
  rule_type_override: string;
  rule_payload_override: GradeRulePayload;
}
