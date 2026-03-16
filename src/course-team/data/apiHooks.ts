/* eslint-disable import/no-extraneous-dependencies */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import * as api from './api';

export const courseTeamQueryKeys = {
  all: ['courseTeam'],
  /** Base key for course team data specific to a courseId */
  courseTeam: (courseId: string) => [...courseTeamQueryKeys.all, courseId],
};

/**
 * Hook to fetch the course team for the given courseId
 */
export const useCourseTeamData = (courseId: string) => (
  useQuery<api.CourseTeam, AxiosError>({
    queryKey: courseTeamQueryKeys.courseTeam(courseId),
    queryFn: () => api.getCourseTeam(courseId),
  })
);

/**
 * Hook to create a new course team user
 */
export const useCreateTeamUser = (courseId: string) => {
  const queryClient = useQueryClient();
  return useMutation<void, AxiosError, string>({
    mutationFn: (email: string) => api.createTeamUser(courseId, email),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: courseTeamQueryKeys.courseTeam(courseId) });
    },
  });
};

export type ChangeRoleRequest = {
  email: string;
  role: string;
};

/**
 * Hook to change the role of a course team user
 */
export const useChangeRoleTeamUser = (courseId: string) => {
  const queryClient = useQueryClient();
  return useMutation<void, AxiosError, ChangeRoleRequest>({
    mutationFn: ({ email, role }: ChangeRoleRequest) => api.changeRoleTeamUser(courseId, email, role),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: courseTeamQueryKeys.courseTeam(courseId) });
    },
  });
};

/**
 * Hook to delete a course team user
 */
export const useDeleteTeamUser = (courseId: string) => {
  const queryClient = useQueryClient();
  return useMutation<void, AxiosError, string>({
    mutationFn: (email: string) => api.deleteTeamUser(courseId, email),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: courseTeamQueryKeys.courseTeam(courseId) });
    },
  });
};
