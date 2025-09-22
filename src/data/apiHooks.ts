import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getWaffleFlags, waffleFlagDefaults } from './api';

/**
 * Get the waffle flags (which enable/disable specific features). They may
 * depend on which course we're in.
 */
export const useWaffleFlags = (courseId?: string) => {
  const queryClient = useQueryClient();

  const { data, isPending: isLoading, isError } = useQuery({
    queryKey: ['waffleFlags', courseId],
    queryFn: () => getWaffleFlags(courseId),
    // Waffle flags change rarely, so never bother refetching them:
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });
  let globalDefaults: typeof waffleFlagDefaults | undefined;
  if (data === undefined && courseId) {
    // If course-specific waffle flags were requested, first default to the
    // global (studio-wide) flags until we've loaded the course-specific ones.
    globalDefaults = queryClient.getQueryData(['waffleFlags', undefined]);
  }
  return {
    ...waffleFlagDefaults,
    ...globalDefaults, // Only used if we're requesting course-specific flags.
    ...data, // the actual flag values loaded from the server
    id: courseId,
    isLoading,
    isError,
  };
};
