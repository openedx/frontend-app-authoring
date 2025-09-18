import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { LibraryMetadata, TeamMember } from '@src/authz-module/constants';

export interface GetTeamMembersResponse {
  members: TeamMember[];
  totalCount: number;
}

const getApiUrl = (path: string) => `${getConfig().STUDIO_BASE_URL}${path || ''}`;

// To-do replece api path once is created
export const getTeamMembers = async (libraryId: string): Promise<TeamMember[]> => {
  const { data } = await getAuthenticatedHttpClient().get(getApiUrl(`/api/authz/libraries/${libraryId}/team/`));
  return data.results;
};

export const validateTeamMember = async (libraryId: string, username: string): Promise<TeamMember> => {
  const { data } = await getAuthenticatedHttpClient().get(getApiUrl(`/api/authz/libraries/${libraryId}/team/${username}/`));
  return data;
};

// To-do validate if the authz will retrive the library information or not
export const getLibrary = async (libraryId: string): Promise<LibraryMetadata> => {
  const { data } = await getAuthenticatedHttpClient().get(getApiUrl(`/api/libraries/v2/${libraryId}/`));
  return {
    id: data.id,
    org: data.org,
    title: data.title,
    slug: data.slug,
  };
};
