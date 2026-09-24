import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// eslint-disable-next-line import/no-unresolved
import { notifyComponentEditSaved } from 'CourseAuthoring/editors/utils';
import { fetchInVideoQuizData, saveInVideoQuizSettings, type SaveVariables } from './api';
import type { InVideoQuizData } from '../types';

export const inVideoQuizDataQueryKey = (blockId: string) => ['inVideoQuizData', blockId];

export const useInVideoQuizData = (blockId: string, studioEndpointUrl: string) =>
  useQuery<InVideoQuizData>({
    queryKey: inVideoQuizDataQueryKey(blockId),
    queryFn: () => fetchInVideoQuizData({ blockId, studioEndpointUrl }),
    enabled: Boolean(blockId),
    // The host's default staleTime is 1h, so without this, reopening the
    // editor soon after closing it can reuse a cache from before the unit's
    // videos/problems changed. Drop the cache as soon as the editor closes
    // instead, and never refetch in the background while it's open, since a
    // refetch mid-edit would reset the form (expandTimemapToQuizItems mints
    // new row ids every time).
    gcTime: 0,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

export const useSaveInVideoQuizSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (variables: SaveVariables) => saveInVideoQuizSettings(variables),
    onSuccess: (_response, variables) => {
      // Ensure the editor shows freshly-saved data next time it loads this
      // block, rather than the stale pre-save cache (e.g. if the modal
      // doesn't fully unmount between close and reopen).
      void queryClient.invalidateQueries({ queryKey: inVideoQuizDataQueryKey(variables.blockId) });

      // Same refresh signal the built-in editors send after saving, so the
      // course-unit page's sidebar (Published/Draft status, Publish button)
      // updates immediately instead of requiring a manual page reload.
      notifyComponentEditSaved();
    },
  });
};
