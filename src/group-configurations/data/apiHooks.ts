/* eslint-disable import/no-extraneous-dependencies */
import { useDispatch } from 'react-redux';
import { AxiosError } from 'axios';
import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

import * as api from './api';

export const groupConfigurationsQueryKeys = {
  all: ['groupConfigurations'],
  /**
   * Base key for data specific to a course
   */
  groupConfigurations: (courseId?: string) => [...groupConfigurationsQueryKeys.all, courseId],
};

/**
 * Hook to fetch content groups and experimental group configurations for a course.
 */
export const useGetGroupConfigurations = (courseId: string) => (
  useQuery<api.GroupConfigurationResponse, AxiosError>({
    queryKey: groupConfigurationsQueryKeys.groupConfigurations(courseId),
    queryFn: () => api.getGroupConfigurations(courseId),
  })
);

/**
 * Use this mutation to create a new content group for a course.
 */
export const useCreateContentGroup = (courseId: string) => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  return useMutation({
    mutationFn: (group: api.GroupConfiguration) => api.createContentGroup(courseId, group),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: groupConfigurationsQueryKeys.groupConfigurations(courseId) });
    },
    onMutate: () => {
    },
  });
};

/**
 * Use this mutation to edit an existing content group in a course.
 */
export const useEditContentGroup = (courseId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (group: api.GroupConfiguration) => api.editContentGroup(courseId, group),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: groupConfigurationsQueryKeys.groupConfigurations(courseId) });
    },
  });
};

/**
 * Use this mutation to delete an existing content group from a course.
 */
export const useDeleteContentGroup = (courseId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ parentGroupId, groupId }: { parentGroupId: number; groupId: number; }) => (
      api.deleteContentGroup(courseId, parentGroupId, groupId)
    ),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: groupConfigurationsQueryKeys.groupConfigurations(courseId) });
    },
  });
};

/**
 * Use this mutation to create a new experiment configuration for a course.
 */
export const useCreateExperimentConfiguration = (courseId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (configuration: api.GroupConfiguration) => api.createExperimentConfiguration(courseId, configuration),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: groupConfigurationsQueryKeys.groupConfigurations(courseId) });
    },
  });
};

/**
 * Use this mutation to edit the experiment configuration for a course.
 */
export const useEditExperimentConfiguration = (courseId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (configuration: api.GroupConfiguration) => api.editExperimentConfiguration(courseId, configuration),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: groupConfigurationsQueryKeys.groupConfigurations(courseId) });
    },
  });
};

/**
 * Use this mutation to delete an existing experiment configuration from a course.
 */
export const useDeleteExperimentConfiguration = (courseId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (configurationId: number) => api.deleteExperimentConfiguration(courseId, configurationId),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: groupConfigurationsQueryKeys.groupConfigurations(courseId) });
    },
  });
};
