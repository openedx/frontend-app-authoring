/* eslint-disable import/no-extraneous-dependencies */
import { AxiosError } from 'axios';
import {
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { useMutationWithProcessingNotification } from '@src/generic/processing-notification/data/apiHooks';
import * as api from './api';
import { AvailableGroup, OnErrorCallbackFunc } from '../types';

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
export const useCreateContentGroup = (courseId: string, onError?: OnErrorCallbackFunc) => {
  const queryClient = useQueryClient();
  return useMutationWithProcessingNotification<AvailableGroup, AxiosError, AvailableGroup>({
    mutationFn: (group: AvailableGroup) => api.createContentGroup(courseId, group),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: groupConfigurationsQueryKeys.groupConfigurations(courseId) });
    },
    onError,
  });
};

/**
 * Use this mutation to edit an existing content group in a course.
 */
export const useEditContentGroup = (courseId: string, onError?: OnErrorCallbackFunc) => {
  const queryClient = useQueryClient();
  return useMutationWithProcessingNotification({
    mutationFn: (group: AvailableGroup) => api.editContentGroup(courseId, group),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: groupConfigurationsQueryKeys.groupConfigurations(courseId) });
    },
    onError,
  });
};

/**
 * Use this mutation to delete an existing content group from a course.
 */
export const useDeleteContentGroup = (courseId: string, onError?: OnErrorCallbackFunc) => {
  const queryClient = useQueryClient();
  return useMutationWithProcessingNotification({
    mutationFn: ({ parentGroupId, groupId }: { parentGroupId: number; groupId: number; }) => (
      api.deleteContentGroup(courseId, parentGroupId, groupId)
    ),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: groupConfigurationsQueryKeys.groupConfigurations(courseId) });
    },
    onError,
  });
};

/**
 * Use this mutation to create a new experiment configuration for a course.
 */
export const useCreateExperimentConfiguration = (courseId: string, onError?: OnErrorCallbackFunc) => {
  const queryClient = useQueryClient();
  return useMutationWithProcessingNotification({
    mutationFn: (configuration: AvailableGroup) => api.createExperimentConfiguration(courseId, configuration),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: groupConfigurationsQueryKeys.groupConfigurations(courseId) });
    },
    onError,
  });
};

/**
 * Use this mutation to edit the experiment configuration for a course.
 */
export const useEditExperimentConfiguration = (courseId: string, onError?: OnErrorCallbackFunc) => {
  const queryClient = useQueryClient();
  return useMutationWithProcessingNotification({
    mutationFn: (configuration: AvailableGroup) => api.editExperimentConfiguration(courseId, configuration),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: groupConfigurationsQueryKeys.groupConfigurations(courseId) });
    },
    onError,
  });
};

/**
 * Use this mutation to delete an existing experiment configuration from a course.
 */
export const useDeleteExperimentConfiguration = (courseId: string, onError?: OnErrorCallbackFunc) => {
  const queryClient = useQueryClient();
  return useMutationWithProcessingNotification({
    mutationFn: (configurationId: number) => api.deleteExperimentConfiguration(courseId, configurationId),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: groupConfigurationsQueryKeys.groupConfigurations(courseId) });
    },
    onError,
  });
};
