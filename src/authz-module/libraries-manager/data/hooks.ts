import { useQuery } from "@tanstack/react-query"
import { TeamMember } from "@src/authz-module/constants";
import { getTeamMembers } from "./api";

/**
 * React Query hook to fetch all team members for a specific library. 
 * It retrieves the full list of members who have access to the given library.
 *
 * @param libraryId - The unique identifier of the library
 *
 * @example
 * ```tsx
 * const { data: teamMembers, isLoading, isError } = useTeamMembers('lib:123');
 * ```
 */
export const useTeamMembers = (libraryId: string) => {
  return useQuery<TeamMember[], Error>({
    queryKey: ['team-members', libraryId],
    queryFn: () => getTeamMembers(libraryId),
    staleTime: 1000 * 60 * 30, // refetch after 30 minutes
  });
};

