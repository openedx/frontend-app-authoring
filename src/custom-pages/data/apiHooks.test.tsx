import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  useReorderCustomPages,
  useUpdateCustomPageName,
  customPagesQueryKeys,
} from './apiHooks';
import {
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
  const wrapper = ({ children }: { children: React.ReactNode; }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { wrapper, queryClient };
};

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

    await waitFor(() => {
      expect(updateCustomPageOrder).toHaveBeenCalledWith(courseId, [
        { tab_locator: 'block-2' },
        { tab_locator: 'block-1' },
      ]);
      const state = queryClient.getQueryState(customPagesQueryKeys.list(courseId));
      expect(state?.isInvalidated).toBe(true);
    });
  });
});

describe('useUpdateCustomPageName', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should update displayName in cache', async () => {
    const { wrapper, queryClient } = createWrapper();

    queryClient.setQueryData(customPagesQueryKeys.list(courseId), mockPages);

    const { result } = renderHook(() => useUpdateCustomPageName(courseId), { wrapper });

    result.current.mutate({ blockId: 'block-2', displayName: 'Renamed Page' });

    await waitFor(() => {
      const cached = queryClient.getQueryData<typeof mockPages>(customPagesQueryKeys.list(courseId));
      expect(cached![1].name).toBe('Renamed Page');
    });
  });
});
