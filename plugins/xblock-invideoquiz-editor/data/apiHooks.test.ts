jest.mock('CourseAuthoring/editors/data/services/cms/api', () => ({
  __esModule: true,
  default: {
    fetchStudioView: jest.fn(),
    fetchByUnitId: jest.fn(),
  },
}));
jest.mock('CourseAuthoring/course-unit/data/api', () => ({
  getCourseContainerChildren: jest.fn(),
}));
jest.mock('@edx/frontend-platform/auth', () => ({
  getAuthenticatedHttpClient: jest.fn(),
}));

import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// eslint-disable-next-line import/no-unresolved
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { useSaveInVideoQuizSettings } from './apiHooks';

const mockPost = jest.fn();
(getAuthenticatedHttpClient as jest.Mock).mockReturnValue({ post: mockPost });

const blockId = 'block-v1:org+course+run+type@invideoquiz+block@quiz-1';
const studioEndpointUrl = 'https://studio.local';

describe('useSaveInVideoQuizSettings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('invalidates the inVideoQuizData cache for this block after a successful save', async () => {
    mockPost.mockResolvedValue({ data: {} });
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');
    const wrapper = ({ children }: { children: React.ReactNode; }) => (
      React.createElement(QueryClientProvider, { client: queryClient }, children)
    );

    const { result } = renderHook(() => useSaveInVideoQuizSettings(), { wrapper });

    result.current.mutate({
      blockId,
      studioEndpointUrl,
      displayName: 'Test',
      videoId: 'video-1',
      timemap: '{"1:30":"problem-1"}',
      jumpBack: '{}',
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['inVideoQuizData', blockId] });
  });

  it('fires the courseRefreshTriggerOnComponentEditSave storage event on success, so the course-unit sidebar refreshes', async () => {
    mockPost.mockResolvedValue({ data: {} });
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const wrapper = ({ children }: { children: React.ReactNode; }) => (
      React.createElement(QueryClientProvider, { client: queryClient }, children)
    );
    const dispatchSpy = jest.spyOn(window, 'dispatchEvent');
    const sessionStorageSpy = jest.spyOn(Storage.prototype, 'setItem');

    const { result } = renderHook(() => useSaveInVideoQuizSettings(), { wrapper });

    result.current.mutate({
      blockId,
      studioEndpointUrl,
      displayName: 'Test',
      videoId: 'video-1',
      timemap: '{}',
      jumpBack: '{}',
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(sessionStorageSpy).toHaveBeenCalledWith('courseRefreshTriggerOnComponentEditSave', expect.any(String));
    expect(dispatchSpy).toHaveBeenCalledWith(expect.objectContaining({
      type: 'storage',
    }));

    dispatchSpy.mockRestore();
    sessionStorageSpy.mockRestore();
  });

  it('does not invalidate the cache when the save fails', async () => {
    mockPost.mockRejectedValue(new Error('save failed'));
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');
    const wrapper = ({ children }: { children: React.ReactNode; }) => (
      React.createElement(QueryClientProvider, { client: queryClient }, children)
    );

    const { result } = renderHook(() => useSaveInVideoQuizSettings(), { wrapper });

    result.current.mutate({
      blockId,
      studioEndpointUrl,
      displayName: 'Test',
      videoId: 'video-1',
      timemap: '{}',
      jumpBack: '{}',
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(invalidateSpy).not.toHaveBeenCalled();
  });
});
