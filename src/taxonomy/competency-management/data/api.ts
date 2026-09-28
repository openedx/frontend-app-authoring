import { camelCaseObject, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import type {
  CompetencyCriteriaGroupsResponse,
  CompetencyCriterion,
  CompetencyRuleProfile,
  CompetencyRuleProfileListResponse,
  CreateCompetencyCriterionPayload,
} from './types';

const getApiBaseUrl = () => getConfig().STUDIO_BASE_URL;

/** The shared `api/cbe/v1/` REST namespace prefix. Confirmed (not inferred)
 * via `#773`'s actual routing chain (`projects/urls.py` ->
 * `openedx_learning/urls.py` -> `cbe/rest_api/urls.py` -> `v1/urls.py`).
 */
const getCbeV1Endpoint = () => new URL('api/cbe/v1/', getApiBaseUrl()).href;
const getCompetencyManagementV1Endpoint = () => new URL('competencies/', getCbeV1Endpoint()).href;

/**
 * Helper for building URLs nested under the competency-management
 * `competencies/` sub-namespace (`#665`/`#681`). `#773`'s endpoint (below)
 * is NOT nested here - see `makeCbeV1Url`.
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
 * below, since it's the one with no internal contradiction. `#773`'s own
 * routing chain (see `getCbeV1Endpoint` above) has since separately
 * confirmed `/api/cbe/v1/` is indeed the right prefix, resolving that
 * doc-typo question in favor of what was already picked here.
 */
const makeUrl = (path: string): string => new URL(path, getCompetencyManagementV1Endpoint()).href;

/** Helper for building URLs directly under the shared `api/cbe/v1/` prefix,
 * for an endpoint that - unlike `#665`/`#681` - isn't nested under
 * `competencies/`. Currently just `#773`'s rule-profiles list, which
 * registers directly under `api/cbe/v1/` via a DRF `DefaultRouter`
 * (`router.register("rule_profiles", ...)`).
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
 * `#773`'s endpoint returns a paginated list of every rule profile in scope
 * (system-default, taxonomy, course, or organization - see `scopeType` on
 * `CompetencyRuleProfile`), not a single object, since it's designed to
 * return more than one row once scoped profiles ship. This app only needs
 * the studio-wide default, so the returned row is the one found by
 * `scopeType === 'system_default'`, never by array position - position
 * isn't guaranteed and isn't what makes a row "the default."
 * @throws {Error} if no `system_default` row is present in the response.
 * Shouldn't happen per the backend's own seeding guarantee, but the array
 * could theoretically be empty on a fresh/misconfigured instance; thrown
 * from within this `queryFn` so `useDefaultCompetencyRuleProfile` surfaces
 * it as the query's own `isError` state, the same as a network failure,
 * rather than it reaching a caller as a raw unhandled exception.
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
): Promise<CompetencyCriterion> {
  const { data } = await getAuthenticatedHttpClient().post(apiUrls.createCompetencyCriterion(tagId), payload);
  return camelCaseObject(data);
}
