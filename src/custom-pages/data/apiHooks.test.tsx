import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  useCustomPages,
  useDeleteCustomPage,
  useAddCustomPage,
  useReorderCustomPages,
  useUpdateCustomPageVisibility,
  customPagesQueryKeys,
} from './apiHooks';
import {
  getCustomPages,
  deleteCustomPage,
  addCustomPage,
  updateCustomPage,
  updateCustomPageOrder,
} from './api';

jest.mock('./api');

const courseId = 'course-v1:edX+DemoX+Demo_Course';
const mockPages = [
  { id: 'block-1', name: 'Page 1', courseStaffOnly: false, tabId: 'static_tab_1' },
  { id: 'block-2', name: 'Page 2', courseStaffOnly: true, tabId: 'static_tab_2' },
];

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { wrapper, queryClient };
};

describe('useCustomPages', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch pages on mount', async () => {
    (getCustomPages as jest.Mock).mockResolvedValue(mockPages);
    const { wrapper } = createWrapper();

    const { result } = renderHook(() => useCustomPages(courseId), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(getCustomPages).toHaveBeenCalledWith(courseId);
    expect(result.current.data).toEqual(mockPages);
  });

  it('should set error state on API failure', async () => {
    (getCustomPages as jest.Mock).mockRejectedValue(new Error('API error'));
    const { wrapper } = createWrapper();

    const { result } = renderHook(() => useCustomPages(courseId), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(getCustomPages).toHaveBeenCalledWith(courseId);
  });
});

describe('useDeleteCustomPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call deleteCustomPage and invalidate list query', async () => {
    (deleteCustomPage as jest.Mock).mockResolvedValue(undefined);
    const { wrapper, queryClient } = createWrapper();

    // Seed cache
    queryClient.setQueryData(customPagesQueryKeys.list(courseId), mockPages);

    const { result } = renderHook(() => useDeleteCustomPage(courseId), { wrapper });

    result.current.mutate('block-1');
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(deleteCustomPage).toHaveBeenCalledWith('block-1');

    const state = queryClient.getQueryState(customPagesQueryKeys.list(courseId));
    expect(state?.isInvalidated).toBe(true);
  });
});

describe('useAddCustomPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call addCustomPage and invalidate list query', async () => {
    (addCustomPage as jest.Mock).mockResolvedValue({ locator: 'block-3' });
    const { wrapper, queryClient } = createWrapper();

    queryClient.setQueryData(customPagesQueryKeys.list(courseId), mockPages);

    const { result } = renderHook(() => useAddCustomPage(courseId), { wrapper });

    result.current.mutate();
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(addCustomPage).toHaveBeenCalledWith(courseId);

    const state = queryClient.getQueryState(customPagesQueryKeys.list(courseId));
    expect(state?.isInvalidated).toBe(true);
  });
});

describe('useReorderCustomPages', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call updateCustomPageOrder with mapped tabs and invalidate list', async () => {
    (updateCustomPageOrder as jest.Mock).mockResolvedValue(undefined);
    const { wrapper, queryClient } = createWrapper();

    const reorderedPages = [mockPages[1], mockPages[0]];
    queryClient.setQueryData(customPagesQueryKeys.list(courseId), mockPages);

    const { result } = renderHook(() => useReorderCustomPages(courseId), { wrapper });

    result.current.mutate(reorderedPages);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(updateCustomPageOrder).toHaveBeenCalledWith(courseId, [
      { tab_locator: 'block-2' },
      { tab_locator: 'block-1' },
    ]);

    const state = queryClient.getQueryState(customPagesQueryKeys.list(courseId));
    expect(state?.isInvalidated).toBe(true);
  });
});

describe('useUpdateCustomPageVisibility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call updateCustomPage with blockId and snake_case metadata, then invalidate', async () => {
    (updateCustomPage as jest.Mock).mockResolvedValue({});
    const { wrapper, queryClient } = createWrapper();

    queryClient.setQueryData(customPagesQueryKeys.list(courseId), mockPages);

    const { result } = renderHook(() => useUpdateCustomPageVisibility(courseId), { wrapper });

    result.current.mutate({ blockId: 'block-1', metadata: { course_staff_only: true } });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(updateCustomPage).toHaveBeenCalledWith({
      blockId: 'block-1',
      metadata: { course_staff_only: true },
    });

    const state = queryClient.getQueryState(customPagesQueryKeys.list(courseId));
    expect(state?.isInvalidated).toBe(true);
  });
});
