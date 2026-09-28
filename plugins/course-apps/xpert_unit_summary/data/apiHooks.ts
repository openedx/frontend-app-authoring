import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { AxiosError } from 'axios';

import {
  deleteXpertSettings,
  getXpertSettings,
  postXpertSettings,
  XpertSettings,
} from './api';

export const xpertUnitSummaryQueryKeys = {
  all: (courseId: string) => ['xpertUnitSummary', courseId],
  settings: (courseId: string) => [...xpertUnitSummaryQueryKeys.all(courseId), 'settings'],
  configurable: (courseId: string) => [...xpertUnitSummaryQueryKeys.all(courseId), 'configurable'],
};

/**
 * Fetch the current Xpert unit summary settings for this course.
 */
export const useXpertSettings = (courseId: string) => (
  useQuery<XpertSettings, AxiosError>({
    queryKey: xpertUnitSummaryQueryKeys.settings(courseId),
    // A course that hasn't been configured yet returns a 404 here, which is expected
    // (not a real failure), so it's treated the same as "no settings" rather than an error.
    queryFn: async () => {
      try {
        return await getXpertSettings(courseId);
      } catch {
        return { enabled: undefined };
      }
    },
  })
);

/**
 * Update the Xpert unit summary settings for this course.
 */
export const useUpdateXpertSettings = (courseId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (state: { enabled: boolean; reset?: boolean; }) => postXpertSettings(courseId, state),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: xpertUnitSummaryQueryKeys.settings(courseId) }),
  });
};

/**
 * Delete (disable) the Xpert unit summary settings for this course.
 */
export const useDeleteXpertSettings = (courseId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => deleteXpertSettings(courseId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: xpertUnitSummaryQueryKeys.settings(courseId) }),
  });
};
