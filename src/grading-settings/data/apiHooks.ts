import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getCourseSettings, getGradingSettings, sendGradingSettings } from './api';

export const useGradingSettings = (courseId: string) => (
  useQuery({
    queryKey: ['gradingSettings', courseId],
    queryFn: () => getGradingSettings(courseId),
  })
);

export const useCourseSettings = (courseId: string) => (
  useQuery({
    queryKey: ['courseSettings', courseId],
    queryFn: () => getCourseSettings(courseId),
  })
);

export const useGradingSettingUpdater = (courseId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (settings) => sendGradingSettings(courseId, settings),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['gradingSettings', courseId] });
    },
  });
};
