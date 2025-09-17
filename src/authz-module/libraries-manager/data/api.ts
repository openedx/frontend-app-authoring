import { getConfig } from '@edx/frontend-platform'
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth'
import { TeamMember } from '@src/authz-module/constants';

export interface GetTeamMembersResponse {
  members: TeamMember[];
  totalCount: number;
}

const getApiUrl = (path: string) => `${getConfig().LMS_BASE_URL}${path || ''}`;

// To-do replece api path once is created
export const getTeamMembers = async (libraryId: string): Promise<TeamMember[]> => {
  const { data } = await getAuthenticatedHttpClient.get(getApiUrl(`/api/authz/libraries/${libraryId}/team`));
  return data.results;
};