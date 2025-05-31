import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getWaffleFlags, waffleFlagDefaults, type WaffleFlagsStatus } from './api';

/**
 * Get the waffle flags (which enable/disable specific features). They may
 * depend on which course we're in.
 */
export const useWaffleFlags = (courseId?: string) => {
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['waffleFlags', courseId],
    queryFn: () => getWaffleFlags(courseId),
    // Waffle flags change rarely, so never bother refetching them:
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });
  let dataOrDefault: WaffleFlagsStatus | undefined = data;
  if (dataOrDefault === undefined && courseId) {
    // If course-specific waffle flags were requested, first default to the
    // global (studio-wide) flags until we've loaded the course-specific ones.
    dataOrDefault = queryClient.getQueryData(['waffleFlags', undefined]);
  }
  if (dataOrDefault === undefined) {
    /** Default flag values to use while loading the actual values */
    dataOrDefault = { id: courseId, ...waffleFlagDefaults };
  }
  return { ...dataOrDefault, isLoading, isError };
};
