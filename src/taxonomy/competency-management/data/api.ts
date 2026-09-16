import { camelCaseObject, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import type {
  CompetencyCriteriaGroupsResponse,
  CompetencyCriterion,
  CompetencyRuleProfile,
  CreateCompetencyCriterionPayload,
} from './types';

const getApiBaseUrl = () => getConfig().STUDIO_BASE_URL;
const getCompetencyManagementV1Endpoint = () => new URL('api/cbe/v1/competencies/', getApiBaseUrl()).href;

/**
 * Helper for building URLs within the competency-management v1 REST
 * namespace. Used only in this file.
 *
 * PLACEHOLDER PATHS, pending re-confirmation once either endpoint actually
 * ships: `#665` and `#681` are still-open backend tickets with no
 * implementation, but their raw GitHub issue text was checked directly (not
 * guessed) and gives two literal, inconsistent prefixes -
 * `#665` states its create endpoint as `POST /api/cbe/v1/competencies/
 * <int:tag_id>/criteria/`; `#681` states its GET endpoint as
 * `GET /cbe/rest_api/v1/competencies/<int:competency_tag_id>/criteria-groups/`
 * - a different prefix (`/cbe/rest_api/v1/` vs `/api/cbe/v1/`) despite
 * `#681` itself saying it registers in "the same `rest_api/v1/urls.py`
 * `#665` already wired into Studio." That's a real inconsistency between
 * the two ticket texts (most likely a documentation typo in `#681`,
 * conflating the Django app's `urls.py` file location with the URL prefix
 * itself), not something to silently pick a side on - both literal
 * strings are recorded here. `#665`'s prefix is used for both endpoints
 * below, since it's the one with no internal contradiction. `#773`
 * (default rule profile) has no endpoint literal in its ticket text at
 * all, so its path below is a plain guess following the same namespace.
 */
const makeUrl = (path: string): string => new URL(path, getCompetencyManagementV1Endpoint()).href;

export const apiUrls = {
  /** GET: the course-level and bottom-tier criteria groups, plus criteria, for one competency (tag). Backs `#681`. */
  competencyCriteriaGroups: (tagId: number) => makeUrl(`${tagId}/criteria-groups/`),
  /** GET: the studio-wide default competency rule profile. Backs `#773`. */
  defaultCompetencyRuleProfile: () => makeUrl('rule-profiles/default/'),
  /** POST: create a new criterion under this competency (tag). Backs `#665`. */
  createCompetencyCriterion: (tagId: number) => makeUrl(`${tagId}/criteria/`),
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
 */
export async function getDefaultCompetencyRuleProfile(): Promise<CompetencyRuleProfile> {
  const { data } = await getAuthenticatedHttpClient().get(apiUrls.defaultCompetencyRuleProfile());
  return camelCaseObject(data);
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
): Promise<CompetencyCriterion> {
  const { data } = await getAuthenticatedHttpClient().post(apiUrls.createCompetencyCriterion(tagId), payload);
  return camelCaseObject(data);
}
