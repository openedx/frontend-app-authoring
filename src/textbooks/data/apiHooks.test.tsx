import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';

import { initializeMocks } from '@src/testUtils';
import {
  getTextbooksApiUrl,
  getUpdateTextbooksApiUrl,
  getEditTextbooksApiUrl,
} from './api';
import {
  useGetTextbooks,
  useCreateTextbook,
  useEditTextbook,
  useDeleteTextbook,
} from './apiHooks';

const { axiosMock, queryClient } = initializeMocks();

const courseId = 'course-v1:edX+TestX+Test_Course';

const wrapper = ({ children }: { children: React.ReactNode; }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

const mockTextbook = {
  id: '1',
  tabTitle: 'Test Textbook',
  chapters: [{ title: 'Chapter 1', url: '/chapter1.pdf' }],
};

const mockTextbookResponse = { textbooks: [mockTextbook] };

describe('textbooks apiHooks', () => {
  beforeEach(() => {
    queryClient.clear();
    axiosMock.reset();
  });

  describe('useGetTextbooks', () => {
    it('should fetch textbooks for a course', async () => {
      axiosMock.onGet(getTextbooksApiUrl(courseId)).reply(200, mockTextbookResponse);

      const { result } = renderHook(() => useGetTextbooks(courseId), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBeFalsy();
      });

      expect(result.current.isSuccess).toBe(true);
      expect(result.current.data).toEqual(mockTextbookResponse);
      expect(axiosMock.history.get[0].url).toEqual(getTextbooksApiUrl(courseId));
    });
  });

  describe('useCreateTextbook', () => {
    it('should create a textbook and invalidate queries', async () => {
      const newTextbook = {
        tabTitle: 'New Textbook',
        chapters: [{ title: 'Chapter 1', url: '/chapter1.pdf' }],
      };

      axiosMock.onPost(getUpdateTextbooksApiUrl(courseId)).reply(200, { id: '2', ...newTextbook });

      const { result } = renderHook(() => useCreateTextbook(courseId), { wrapper });

      await result.current.mutateAsync(newTextbook);

      await waitFor(() => {
        expect(axiosMock.history.post[0].url).toEqual(getUpdateTextbooksApiUrl(courseId));
      });
    });
  });

  describe('useEditTextbook', () => {
    it('should edit a textbook and invalidate queries', async () => {
      const updatedTextbook = {
        id: '1',
        tabTitle: 'Updated Textbook',
        chapters: [{ title: 'Updated Chapter', url: '/updated.pdf' }],
      };

      axiosMock
        .onPut(getEditTextbooksApiUrl(courseId, updatedTextbook.id))
        .reply(200, updatedTextbook);

      const { result } = renderHook(() => useEditTextbook(courseId), { wrapper });

      await result.current.mutateAsync(updatedTextbook);

      await waitFor(() => {
        expect(axiosMock.history.put[0].url).toEqual(
          getEditTextbooksApiUrl(courseId, updatedTextbook.id),
        );
      });
    });
  });

  describe('useDeleteTextbook', () => {
    it('should delete a textbook and invalidate queries', async () => {
      const textbookId = '1';

      axiosMock
        .onDelete(getEditTextbooksApiUrl(courseId, textbookId))
        .reply(204);

      const { result } = renderHook(() => useDeleteTextbook(courseId), { wrapper });

      await result.current.mutateAsync(textbookId);

      await waitFor(() => {
        expect(axiosMock.history.delete[0].url).toEqual(
          getEditTextbooksApiUrl(courseId, textbookId),
        );
      });
    });
  });
});
