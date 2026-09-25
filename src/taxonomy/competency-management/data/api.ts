import { camelCaseObject, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import type {
  CompetencyCriteriaGroup,
  CompetencyCriteriaGroupsResponse,
  CompetencyCriterion,
  CompetencyGroupLogicOperator,
  CompetencyRuleProfile,
  CompetencyRuleProfileListResponse,
  CreateCompetencyCriterionPayload,
  CreateCompetencyCriterionResponse,
  GradeRulePayload,
  UpdateCompetencyCriteriaGroupPayload,
  UpdateCompetencyCriteriaRulePayload,
} from './types';

const getApiBaseUrl = () => getConfig().STUDIO_BASE_URL;

/** The shared `api/cbe/v1/` REST namespace prefix, confirmed via the
 * backend's actual routing chain (not inferred from ticket text).
 */
const getCbeV1Endpoint = () => new URL('api/cbe/v1/', getApiBaseUrl()).href;
const getCompetencyManagementV1Endpoint = () => new URL('competencies/', getCbeV1Endpoint()).href;

/** Helper for building URLs nested under the competency-management
 * `competencies/` sub-namespace (`#665`/`#681`). `#773`'s endpoint (below)
 * is NOT nested here - see `makeCbeV1Url`.
 *
 * `#665` and `#681` are still-open backend tickets whose issue text gives
 * two inconsistent URL prefixes; `#665`'s prefix (used for both endpoints
 * below) is the one later confirmed by `#773`'s live routing chain.
 */
const makeUrl = (path: string): string => new URL(path, getCompetencyManagementV1Endpoint()).href;

/** Helper for an endpoint that, unlike `#665`/`#681`, isn't nested under
 * `competencies/` - currently just `#773`'s rule-profiles list.
 */
const makeCbeV1Url = (path: string): string => new URL(path, getCbeV1Endpoint()).href;

export const apiUrls = {
  /** GET: the course-level and bottom-tier criteria groups, plus criteria, for one competency (tag). Backs `#681`. */
  competencyCriteriaGroups: (tagId: number) => makeUrl(`${tagId}/criteria-groups/`),
  /** GET: the paginated list of competency rule profiles (system-default, taxonomy, course, or
   * organization scoped - see `scopeType` on `CompetencyRuleProfile`). Backs `#773`.
   */
  defaultCompetencyRuleProfile: () => makeCbeV1Url('rule_profiles/'),
  /** POST: create a new criterion under this competency (tag). Backs `#665`. */
  createCompetencyCriterion: (tagId: number) => makeUrl(`${tagId}/criteria/`),
  /** PATCH: update a bottom-tier group's any/all combining logic. Backs `#760`. */
  updateCompetencyCriteriaGroup: (tagId: number, groupId: number) => makeUrl(`${tagId}/criteria-groups/${groupId}/`),
  /** PATCH: batch-update a rule box's score across every criterion sharing it. Backs `#759` -
   * not nested under `competencies/<tagId>/`, so built with `makeCbeV1Url` instead of `makeUrl`.
   */
  updateCompetencyCriteriaRule: (groupId: number) => makeCbeV1Url(`criteria-groups/${groupId}/criteria/bulk-update/`),
} satisfies Record<string, (...args: any[]) => string>;

/**
 * Get one competency's existing criteria groups and criteria.
 * @param tagId The id of the competency (tag) to load associations for.
 */
export async function getCompetencyCriteriaGroups(tagId: number): Promise<CompetencyCriteriaGroupsResponse> {
  const { data } = await getAuthenticatedHttpClient().get(apiUrls.competencyCriteriaGroups(tagId));
  return camelCaseObject(data);
}

/**
 * Get the studio-wide default competency rule profile, used to resolve a
 * criterion that carries no override fields of its own.
 *
 * `#773`'s endpoint returns a paginated list of every rule profile in scope,
 * not a single object, so the returned row is the one found by
 * `scopeType === 'system_default'`, never by array position.
 * @throws {Error} if no `system_default` row is present (shouldn't happen
 * per the backend's seeding guarantee); thrown inside this `queryFn` so
 * `useDefaultCompetencyRuleProfile` surfaces it as `isError`, same as a
 * network failure.
 */
export async function getDefaultCompetencyRuleProfile(): Promise<CompetencyRuleProfile> {
  const { data } = await getAuthenticatedHttpClient().get(apiUrls.defaultCompetencyRuleProfile());
  const { results } = camelCaseObject(data) as CompetencyRuleProfileListResponse;
  const systemDefaultProfile = results.find((profile) => profile.scopeType === 'system_default');
  if (!systemDefaultProfile) {
    throw new Error('No system_default competency rule profile was found in the rule_profiles response.');
  }
  return systemDefaultProfile;
}

/**
 * Create a new criterion associating a piece of course content with a
 * competency.
 * @param tagId The id of the competency (tag) the new criterion belongs to.
 * @param payload The new criterion's fields, snake_case per the wire format.
 */
export async function createCompetencyCriterion(
  tagId: number,
  payload: CreateCompetencyCriterionPayload,
): Promise<CreateCompetencyCriterionResponse> {
  const { data } = await getAuthenticatedHttpClient().post(apiUrls.createCompetencyCriterion(tagId), payload);
  return camelCaseObject(data);
}

/**
 * Update a bottom-tier group's any/all combining logic (`#760`).
 * @param tagId The competency (tag) the group belongs to.
 * @param groupId The bottom-tier group to update.
 * @param logicOperator The new operator.
 */
export async function updateCompetencyCriteriaGroupOperator(
  tagId: number,
  groupId: number,
  logicOperator: CompetencyGroupLogicOperator,
): Promise<CompetencyCriteriaGroup> {
  const payload: UpdateCompetencyCriteriaGroupPayload = { logic_operator: logicOperator };
  const { data } = await getAuthenticatedHttpClient().patch(
    apiUrls.updateCompetencyCriteriaGroup(tagId, groupId),
    payload,
  );
  return camelCaseObject(data);
}

/**
 * Batch-update a rule box's score threshold, across every criterion that
 * currently shares it (`#759`). Always sends explicit override values,
 * never a shared rule-profile reference - the backend reassigns a
 * criterion back to a matching default profile itself when the submitted
 * value matches it. Atomic; a `criterionIds` entry outside the target
 * group, or nonexistent, rejects the whole request and changes nothing.
 * @param groupId The bottom-tier group the batched criteria belong to.
 * @param criterionIds Every criterion currently in the rule box being edited.
 * @param ruleType The rule box's own rule type, pinned unchanged - only the
 * numeric value is user-editable (`#794`'s own scope).
 * @param rulePayload The new score threshold, applied to every listed criterion.
 * @returns The updated criteria as actually persisted - the caller derives
 * the box's new focus key from this, not from the request, since a "reset
 * to default" edit may echo back a profile reference instead.
 */
export async function updateCompetencyCriteriaRule(
  groupId: number,
  criterionIds: number[],
  ruleType: string,
  rulePayload: GradeRulePayload,
): Promise<CompetencyCriterion[]> {
  const payload: UpdateCompetencyCriteriaRulePayload = {
    criterion_ids: criterionIds,
    rule_type_override: ruleType,
    rule_payload_override: rulePayload,
  };
  const { data } = await getAuthenticatedHttpClient().patch(apiUrls.updateCompetencyCriteriaRule(groupId), payload);
  return camelCaseObject(data);
}
