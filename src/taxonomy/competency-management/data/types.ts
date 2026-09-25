/**
 * Types for the competency-criteria-associations data model, per
 * `docs/openedx_learning/decisions/0002-competency-criteria-model.rst`
 * (ADR 0002) in `openedx-core`. Every read-hook response is normalized
 * through `camelCaseObject` (see `./apiHooks.ts`), so these describe the
 * camelCase shape the app consumes, never the wire snake_case - except the
 * request-body payload types (`CreateCompetencyCriterionPayload`,
 * `UpdateCompetencyCriteriaGroupPayload`, `UpdateCompetencyCriteriaRulePayload`),
 * which go out as the API expects (snake_case).
 */

/** How a group's immediate children combine: "AND" (all) or "OR" (any). A
 * course-level group's operator governs how its bottom-tier children
 * combine; a bottom-tier group's own operator governs how its rule boxes
 * combine.
 */
export type CompetencyGroupLogicOperator = 'AND' | 'OR';

/** One criteria-group row, as returned flat in
 * `CompetencyCriteriaGroupsResponse.groups`. The API models a three-level
 * tree per competency (tag) with no `depth` field of its own, so a group's
 * level is inferred structurally from `parentId`/`courseKey`:
 * - root: `parentId: null`, `courseKey: null` - one per competency,
 *   instance-wide. Never rendered.
 * - course-level: `parentId` is the root's id, `courseKey` set - one per
 *   course this competency has any criteria in.
 * - leaf ("bottom-tier"): `parentId` is a course-level group's id,
 *   `courseKey: null`. Holds criteria directly; the backend rejects a
 *   persisted group with no criteria (ADR 0002).
 */
export interface CompetencyCriteriaGroup {
  id: number;
  parentId: number | null;
  /** The competency (tag) this group belongs to. */
  tagId: number;
  courseKey: string | null;
  name: string;
  /** Sibling ordering within the same parent, ascending. */
  ordering: number;
  logicOperator: CompetencyGroupLogicOperator;
  archived: boolean;
}

/** A course-level group, narrowed to guarantee `courseKey` is set - see
 * `CompetencyCriteriaGroup`.
 */
export interface CourseCompetencyCriteriaGroup extends CompetencyCriteriaGroup {
  courseKey: string;
}

/** A leaf ("bottom-tier") group, narrowed to guarantee `courseKey` is
 * `null` - see `CompetencyCriteriaGroup`.
 */
export interface BottomTierCompetencyCriteriaGroup extends CompetencyCriteriaGroup {
  courseKey: null;
}

/** The "Grade" rule payload - the only rule type ADR 0002 documents today. */
export interface GradeRulePayload {
  op: 'gte' | 'lte' | 'eq';
  /** A 0.0-1.0 fraction, not a 0-100 percentage. */
  value: number;
  scale: 'percent';
}

/** A group's persisted association to one piece of course content (a
 * gradable subsection, per this ticket's scope). Carries exactly one of {a
 * shared `CompetencyRuleProfile` reference} or {both override fields},
 * never both, never neither (ADR 0002) - `ruleProfileId` is set alone, or
 * both override fields are set together. Resolve which rule actually
 * governs a criterion with `effectiveRuleOf` in `../utils`, never by
 * reading these fields directly.
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

/** `#681`'s documented response shape: a flat `groups` array (root,
 * course-level, and leaf rows mixed - see `CompetencyCriteriaGroup`) plus a
 * flat `criteria` array, each criterion pointing at its leaf group by id.
 * See `buildCompetencyCriteriaGroupsIndex` in `../utils` for the tree this
 * gets indexed into.
 */
export interface CompetencyCriteriaGroupsResponse {
  groups: CompetencyCriteriaGroup[];
  criteria: CompetencyCriterion[];
}

/** One competency rule profile (`#773`) - the studio-wide default is the
 * only one this app resolves criteria against today, but the response this
 * type describes can carry `taxonomy`/`course`/`organization`-scoped rows
 * too (see `scopeType`).
 */
export interface CompetencyRuleProfile {
  id: number;
  /** Which scope this profile applies to: `'system_default'`,
   * `'taxonomy'`, `'course'`, or `'organization'`. Computed server-side by a
   * `SerializerMethodField` from which scope column is set on the row - the
   * raw scope column itself is never sent on the wire. Only
   * `'system_default'` is used by this app today (see
   * `getDefaultCompetencyRuleProfile` in `./api`); no scoped profile ships
   * in this MVP phase yet.
   */
  scopeType: string;
  ruleType: string;
  rulePayload: GradeRulePayload;
  archived: boolean;
}

/** `#773`'s actual list-endpoint envelope: a standard DRF `PageNumberPagination`
 * -style response (`CompetencyRuleProfilePagination`, page size 100), not a
 * single object. The endpoint returns every rule profile in scope - just the
 * one `system_default` row in this MVP phase, but designed to return more
 * once scoped profiles ship - so callers must pick the row they want out of
 * `results` themselves; see `getDefaultCompetencyRuleProfile` in `./api`.
 */
export interface CompetencyRuleProfileListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: CompetencyRuleProfile[];
}

/** The rule that actually governs one rule box, after resolving a
 * criterion's own override fields against the system default profile (see
 * `effectiveRuleOf` in `../utils`).
 */
export interface EffectiveRule {
  ruleType: string;
  rulePayload: GradeRulePayload;
}

/** One or more criteria that share the same effective rule, grouped for
 * display as a single rule box (see `ruleBoxesForGroup` in `../utils`).
 */
export interface RuleBox {
  /** Stable key derived from the effective rule's own fields - see
   * `ruleKeyOf` in `../utils`.
   */
  key: string;
  rule: EffectiveRule;
  criteria: CompetencyCriterion[];
}

/** Request body for creating a new criterion (`#665`). Snake_case, since
 * this goes out on the wire as the API expects it - the opposite of every
 * response type above.
 */
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

/** Request body for updating a bottom-tier group's any/all combining logic
 * (`#760`). `logic_operator` is the only field, so this is just
 * `CompetencyGroupLogicOperator` under its own wire key - named separately
 * from `CompetencyGroupLogicOperator` itself for symmetry with
 * `CreateCompetencyCriterionPayload`/`UpdateCompetencyCriteriaRulePayload`,
 * the other request-body types in this file.
 */
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
