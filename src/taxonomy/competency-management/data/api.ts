import { camelCaseObject, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import type {
  CompetencyCriteriaGroupsResponse,
  CompetencyRuleProfile,
  CompetencyRuleProfileListResponse,
  CreateCompetencyCriterionPayload,
  CreateCompetencyCriterionResponse,
} from './types';

const getApiBaseUrl = () => getConfig().STUDIO_BASE_URL;

const getCbeV1Endpoint = () => new URL('api/cbe/v1/', getApiBaseUrl()).href;
const getCompetencyManagementV1Endpoint = () => new URL('competencies/', getCbeV1Endpoint()).href;

/** Builds a URL under `api/cbe/v1/competencies/`. */
const makeUrl = (path: string): string => new URL(path, getCompetencyManagementV1Endpoint()).href;

/** Builds a URL under `api/cbe/v1/`, outside `competencies/`. */
const makeCbeV1Url = (path: string): string => new URL(path, getCbeV1Endpoint()).href;

export const apiUrls = {
  /** GET: the course-level and bottom-tier criteria groups, plus criteria, for one competency (tag). */
  competencyCriteriaGroups: (tagId: number) => makeUrl(`${tagId}/criteria-groups/`),
  /** GET: the paginated list of competency rule profiles (see `scopeType` on `CompetencyRuleProfile`). */
  defaultCompetencyRuleProfile: () => makeCbeV1Url('rule_profiles/'),
  /** POST: create a new criterion under this competency (tag). */
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
 * The endpoint lists every rule profile in scope, so the row is picked by
 * `scopeType === 'system_default'`, not by array position.
 * @throws {Error} if the response has no `system_default` row.
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
