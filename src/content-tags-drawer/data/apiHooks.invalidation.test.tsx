import React from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { useContentTaxonomyTagsUpdater } from './apiHooks';
import { useContentTagsCount } from '../../generic/data/apiHooks';

const mockGetTagsCount = jest.fn();

jest.mock('./api', () => ({
  updateContentTaxonomyTags: jest.fn().mockResolvedValue({}),
  getContentTaxonomyTagsData: jest.fn().mockResolvedValue({}),
  getContentTaxonomyTagsCount: jest.fn().mockResolvedValue(3),
}));

jest.mock('../../generic/data/api', () => ({
  ...jest.requireActual('../../generic/data/api'),
  getTagsCount: (...args: unknown[]) => mockGetTagsCount(...args),
}));

describe('useContentTaxonomyTagsUpdater count invalidation', () => {
  it('refreshes the count the outline card badge reads after tags are saved', async () => {
    const contentId = 'block-v1:edX+DemoX+Demo_Course+type@vertical+block@abc';
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>n
        <MemoryRouter>{children}</MemoryRouter>
      </QueryClientProvider>
    );

    mockGetTagsCount.mockResolvedValue({ [contentId]: 2 });

    const { result } = renderHook(() => ({
      badge: useContentTagsCount(contentId),
      updater: useContentTaxonomyTagsUpdater(contentId),
    }), { wrapper });

    await waitFor(() => expect(result.current.badge.data).toBe(2));

    // Backend now reports the new count
    mockGetTagsCount.mockResolvedValue({ [contentId]: 3 });
    await act(async () => {
      await result.current.updater.mutateAsync({ tagsData: [] });
    });

    await waitFor(() => expect(result.current.badge.data).toBe(3));
  });
});