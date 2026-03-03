/* eslint-disable import/no-extraneous-dependencies */
import { AxiosError } from 'axios';
import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

import { useToastContext } from '@src/generic/toast-context';
import { NOTIFICATION_MESSAGES } from '@src/constants';
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
  const {
    showToast,
    closeToast,
  } = useToastContext();
  return useMutation<AvailableGroup, AxiosError, AvailableGroup>({
    mutationFn: (group: AvailableGroup) => api.createContentGroup(courseId, group),
    onSettled: () => {
      closeToast();
      queryClient.invalidateQueries({ queryKey: groupConfigurationsQueryKeys.groupConfigurations(courseId) });
    },
    onMutate: () => {
      showToast(NOTIFICATION_MESSAGES.saving);
    },
    onError,
  });
};

/**
 * Use this mutation to edit an existing content group in a course.
 */
export const useEditContentGroup = (courseId: string, onError?: OnErrorCallbackFunc) => {
  const queryClient = useQueryClient();
  const {
    showToast,
    closeToast,
  } = useToastContext();
  return useMutation({
    mutationFn: (group: AvailableGroup) => api.editContentGroup(courseId, group),
    onSettled: () => {
      closeToast();
      queryClient.invalidateQueries({ queryKey: groupConfigurationsQueryKeys.groupConfigurations(courseId) });
    },
    onMutate: () => {
      showToast(NOTIFICATION_MESSAGES.saving);
    },
    onError,
  });
};

/**
 * Use this mutation to delete an existing content group from a course.
 */
export const useDeleteContentGroup = (courseId: string, onError?: OnErrorCallbackFunc) => {
  const queryClient = useQueryClient();
  const {
    showToast,
    closeToast,
  } = useToastContext();
  return useMutation({
    mutationFn: ({ parentGroupId, groupId }: { parentGroupId: number; groupId: number; }) => (
      api.deleteContentGroup(courseId, parentGroupId, groupId)
    ),
    onSettled: () => {
      closeToast();
      queryClient.invalidateQueries({ queryKey: groupConfigurationsQueryKeys.groupConfigurations(courseId) });
    },
    onMutate: () => {
      showToast(NOTIFICATION_MESSAGES.deleting);
    },
    onError,
  });
};

/**
 * Use this mutation to create a new experiment configuration for a course.
 */
export const useCreateExperimentConfiguration = (courseId: string, onError?: OnErrorCallbackFunc) => {
  const queryClient = useQueryClient();
  const {
    showToast,
    closeToast,
  } = useToastContext();
  return useMutation({
    mutationFn: (configuration: AvailableGroup) => api.createExperimentConfiguration(courseId, configuration),
    onSettled: () => {
      closeToast();
      queryClient.invalidateQueries({ queryKey: groupConfigurationsQueryKeys.groupConfigurations(courseId) });
    },
    onMutate: () => {
      showToast(NOTIFICATION_MESSAGES.saving);
    },
    onError,
  });
};

/**
 * Use this mutation to edit the experiment configuration for a course.
 */
export const useEditExperimentConfiguration = (courseId: string, onError?: OnErrorCallbackFunc) => {
  const queryClient = useQueryClient();
  const {
    showToast,
    closeToast,
  } = useToastContext();
  return useMutation({
    mutationFn: (configuration: AvailableGroup) => api.editExperimentConfiguration(courseId, configuration),
    onSettled: () => {
      closeToast();
      queryClient.invalidateQueries({ queryKey: groupConfigurationsQueryKeys.groupConfigurations(courseId) });
    },
    onMutate: () => {
      showToast(NOTIFICATION_MESSAGES.saving);
    },
    onError,
  });
};

/**
 * Use this mutation to delete an existing experiment configuration from a course.
 */
export const useDeleteExperimentConfiguration = (courseId: string, onError?: OnErrorCallbackFunc) => {
  const queryClient = useQueryClient();
  const {
    showToast,
    closeToast,
  } = useToastContext();
  return useMutation({
    mutationFn: (configurationId: number) => api.deleteExperimentConfiguration(courseId, configurationId),
    onSettled: () => {
      closeToast();
      queryClient.invalidateQueries({ queryKey: groupConfigurationsQueryKeys.groupConfigurations(courseId) });
    },
    onMutate: () => {
      showToast(NOTIFICATION_MESSAGES.deleting);
    },
    onError,
  });
};
