/* eslint-disable import/no-extraneous-dependencies */
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { useMutationWithProcessingNotification } from '@src/generic/processing-notification/data/apiHooks';
import * as api from './api';

export const textbooksQueryKeys = {
  all: ['textbooks'],
  /** Base key for textbook data specific to a courseId */
  textbooks: (courseId: string) => [...textbooksQueryKeys.all, courseId],
};

/**
 * Hook to fetch textbooks for the given courseId
 */
export const useTextbooks = (courseId: string) => (
  useQuery<api.TextbookResponse, AxiosError>({
    queryKey: textbooksQueryKeys.textbooks(courseId),
    queryFn: () => api.getTextbooks(courseId),
  })
);

/**
 * Hook to create a new textbook for a course
 */
export const useCreateTextbook = (courseId: string) => {
  const queryClient = useQueryClient();
  return useMutationWithProcessingNotification<api.Textbook, AxiosError, api.BaseTextbook>({
    mutationFn: (textbook: api.BaseTextbook) => api.createTextbook(courseId, textbook),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: textbooksQueryKeys.textbooks(courseId) });
    },
  });
};

/**
 * Hook to edit an existing textbook for a course
 */
export const useEditTextbook = (courseId: string) => {
  const queryClient = useQueryClient();
  return useMutationWithProcessingNotification<api.Textbook, AxiosError, api.Textbook>({
    mutationFn: (textbook: api.Textbook) => api.editTextbook(courseId, textbook),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: textbooksQueryKeys.textbooks(courseId) });
    },
  });
};

/**
 * Hook to delete a textbook from a course
 */
export const useDeleteTextbook = (courseId: string) => {
  const queryClient = useQueryClient();
  return useMutationWithProcessingNotification<void, AxiosError, string>({
    mutationFn: (textbookId: string) => api.deleteTextbook(courseId, textbookId),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: textbooksQueryKeys.textbooks(courseId) });
    },
  });
};
