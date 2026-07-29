import { AxiosError } from 'axios';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { NOTIFICATION_MESSAGES } from '../../constants';
import { closeToastOutsideReact, showToastOutsideReact } from '../../generic/toast-context';
import {
  createUpdate,
  deleteUpdate,
  editHandouts,
  editUpdate,
  getCourseHandouts,
  getCourseUpdates,
  type CourseHandouts,
  type CourseUpdate,
  type CourseUpdateInput,
} from './api';

export const courseUpdatesQueryKeys = {
  all: ['courseUpdates'] as const,
  updates: (courseId: string) => [...courseUpdatesQueryKeys.all, courseId, 'updates'] as const,
  handouts: (courseId: string) => [...courseUpdatesQueryKeys.all, courseId, 'handouts'] as const,
};

export const useCourseUpdatesQuery = (courseId: string) =>
  useQuery<CourseUpdate[], AxiosError>({
    queryKey: courseUpdatesQueryKeys.updates(courseId),
    queryFn: () => getCourseUpdates(courseId),
    retry: false, // surface page-load failures immediately; no duplicate requests
  });

export const useCourseHandoutsQuery = (courseId: string) =>
  useQuery<CourseHandouts, AxiosError>({
    queryKey: courseUpdatesQueryKeys.handouts(courseId),
    queryFn: () => getCourseHandouts(courseId),
    retry: false, // surface page-load failures immediately; no duplicate requests
  });

const useSavingMutation = <TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  onSuccess: () => Promise<unknown> | void,
  notification: string = NOTIFICATION_MESSAGES.saving,
) =>
  useMutation({
    mutationFn,
    onMutate: () => showToastOutsideReact(notification),
    onSettled: () => closeToastOutsideReact(),
    onSuccess,
  });

export const useCreateCourseUpdate = (courseId: string) => {
  const queryClient = useQueryClient();
  return useSavingMutation(
    (data: CourseUpdateInput) => createUpdate(courseId, data),
    () => queryClient.invalidateQueries({ queryKey: courseUpdatesQueryKeys.updates(courseId) }),
  );
};

export const useEditCourseUpdate = (courseId: string) => {
  const queryClient = useQueryClient();
  return useSavingMutation(
    (data: CourseUpdate) => editUpdate(courseId, data),
    () => queryClient.invalidateQueries({ queryKey: courseUpdatesQueryKeys.updates(courseId) }),
  );
};

export const useDeleteCourseUpdate = (courseId: string) => {
  const queryClient = useQueryClient();
  return useSavingMutation(
    (updateId: number) => deleteUpdate(courseId, updateId),
    () => queryClient.invalidateQueries({ queryKey: courseUpdatesQueryKeys.updates(courseId) }),
    NOTIFICATION_MESSAGES.deleting,
  );
};

export const useEditCourseHandouts = (courseId: string) => {
  const queryClient = useQueryClient();
  return useSavingMutation(
    (data: CourseHandouts) => editHandouts(courseId, data),
    () => queryClient.invalidateQueries({ queryKey: courseUpdatesQueryKeys.handouts(courseId) }),
  );
};
