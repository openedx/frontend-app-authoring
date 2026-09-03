import { renderHook, waitFor, initializeMocks, makeQueryClientWrapper } from '@src/testUtils';
import {
  useLinkCheckStatus,
  useRerunLinkUpdateStatus,
  useStartLinkCheck,
  useUpdateAllPreviousRunLinks,
  useUpdateSinglePreviousRunLink,
  courseOptimizerQueryKeys,
} from './apiHooks';
import {
  getLinkCheckStatusApiUrl,
  getRerunLinkUpdateStatusApiUrl,
  postLinkCheckCourseApiUrl,
  postRerunLinkUpdateApiUrl,
} from './api';

const courseId = 'course-123';

describe('course optimizer api hooks', () => {
  it('normalizes link-check status data and polls while in progress', async () => {
    const { axiosMock, queryClient } = initializeMocks();
    axiosMock.onGet(getLinkCheckStatusApiUrl(courseId)).reply(200, {
      LinkCheckStatus: 'In Progress',
      LinkCheckOutput: null,
      LinkCheckCreatedAt: null,
    });

    const { result } = renderHook(() => useLinkCheckStatus(courseId), {
      wrapper: makeQueryClientWrapper(queryClient),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual({
      linkCheckStatus: 'In Progress',
      linkCheckOutput: null,
      linkCheckCreatedAt: null,
    });
    const query = queryClient.getQueryCache().find({
      queryKey: courseOptimizerQueryKeys.linkCheckStatus(courseId),
    });
    expect(query?.observers[0]?.options.retry).toBe(false);
    const refetchInterval = query?.observers[0]?.options.refetchInterval;
    expect(typeof refetchInterval === 'function' && refetchInterval(query!)).toBe(2000);

    queryClient.setQueryData(courseOptimizerQueryKeys.linkCheckStatus(courseId), {
      linkCheckStatus: 'Succeeded',
      linkCheckOutput: null,
      linkCheckCreatedAt: null,
    });
    expect(typeof refetchInterval === 'function' && refetchInterval(query!)).toBe(false);
  });

  it('normalizes rerun status data and stops polling at a terminal status', async () => {
    const { axiosMock, queryClient } = initializeMocks();
    axiosMock.onGet(getRerunLinkUpdateStatusApiUrl(courseId)).reply(200, {
      status: 'Succeeded',
      Results: [{ id: 'block-1', success: true, original_url: 'https://old.example.com', type: 'html' }],
    });

    const { result } = renderHook(() => useRerunLinkUpdateStatus(courseId), {
      wrapper: makeQueryClientWrapper(queryClient),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual({
      status: 'Succeeded',
      results: [{
        id: 'block-1',
        success: true,
        newUrl: null,
        originalUrl: 'https://old.example.com',
        type: 'html',
      }],
    });
    const query = queryClient.getQueryCache().find({
      queryKey: courseOptimizerQueryKeys.rerunLinkUpdateStatus(courseId),
    });
    const refetchInterval = query?.observers[0]?.options.refetchInterval;
    expect(typeof refetchInterval === 'function' && refetchInterval(query!)).toBe(false);
  });

  it('normalizes lowercase uninitiated rerun status', async () => {
    const { axiosMock, queryClient } = initializeMocks();
    axiosMock.onGet(getRerunLinkUpdateStatusApiUrl(courseId)).reply(200, {
      status: 'uninitiated',
      results: [],
    });

    const { result } = renderHook(() => useRerunLinkUpdateStatus(courseId), {
      wrapper: makeQueryClientWrapper(queryClient),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual({ status: 'Uninitiated', results: [] });
  });

  it('normalizes rerun status response with an omitted results field', async () => {
    const { axiosMock, queryClient } = initializeMocks();
    axiosMock.onGet(getRerunLinkUpdateStatusApiUrl(courseId)).reply(200, { status: 'Pending' });

    const { result } = renderHook(() => useRerunLinkUpdateStatus(courseId), {
      wrapper: makeQueryClientWrapper(queryClient),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual({ status: 'Pending', results: [] });
  });

  it('starts a scan without retrying the mutation or retaining terminal query data', async () => {
    const { axiosMock, queryClient } = initializeMocks();
    axiosMock.onPost(postLinkCheckCourseApiUrl(courseId)).reply(200, { LinkCheckStatus: 'Pending' });

    queryClient.setQueryData(courseOptimizerQueryKeys.linkCheckStatus(courseId), {
      linkCheckStatus: 'Succeeded',
      linkCheckOutput: { sections: [] },
      linkCheckCreatedAt: '2024-01-01',
    });
    const { result } = renderHook(() => useStartLinkCheck(courseId), {
      wrapper: makeQueryClientWrapper(queryClient),
    });
    await expect(result.current.mutateAsync()).resolves.toEqual({ linkCheckStatus: 'Pending' });
    expect(queryClient.getQueryData(courseOptimizerQueryKeys.linkCheckStatus(courseId))).toEqual({
      linkCheckStatus: 'Pending',
      linkCheckOutput: null,
      linkCheckCreatedAt: null,
    });
    expect(axiosMock.history.post).toHaveLength(1);
    expect(result.current.failureCount).toBe(0);
  });

  it('continues polling when a current operation is active despite a terminal cached status', async () => {
    const { axiosMock, queryClient } = initializeMocks();
    axiosMock.onGet(getRerunLinkUpdateStatusApiUrl(courseId)).reply(200, { status: 'Succeeded', results: [] });

    const { result } = renderHook(() => useRerunLinkUpdateStatus(courseId, { enabled: true, polling: true }), {
      wrapper: makeQueryClientWrapper(queryClient),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const query = queryClient.getQueryCache().find({
      queryKey: courseOptimizerQueryKeys.rerunLinkUpdateStatus(courseId),
    });
    const refetchInterval = query?.observers[0]?.options.refetchInterval;
    expect(typeof refetchInterval === 'function' && refetchInterval(query!)).toBe(2000);
  });

  it('updates all previous-run links', async () => {
    const { axiosMock, queryClient } = initializeMocks();
    axiosMock.onPost(postRerunLinkUpdateApiUrl(courseId)).reply(200, { status: 'Pending' });
    axiosMock.onGet(getRerunLinkUpdateStatusApiUrl(courseId)).reply(200, { status: 'Pending', results: [] });

    const { result } = renderHook(() => useUpdateAllPreviousRunLinks(courseId), {
      wrapper: makeQueryClientWrapper(queryClient),
    });
    await expect(result.current.mutateAsync()).resolves.toEqual({ status: 'Pending' });
    expect(queryClient.getQueryData(courseOptimizerQueryKeys.rerunLinkUpdateStatus(courseId))).toEqual({
      status: 'Pending',
      results: [],
    });
    expect(JSON.parse(axiosMock.history.post[0].data)).toEqual({ action: 'all' });
  });

  it('accepts a terminal status when there is no pre-mutation cache entry', async () => {
    const { axiosMock, queryClient } = initializeMocks();
    const queryKey = courseOptimizerQueryKeys.rerunLinkUpdateStatus(courseId);
    axiosMock.onPost(postRerunLinkUpdateApiUrl(courseId)).reply(200, { status: 'Pending' });
    let getStatusCalls = 0;
    axiosMock.onGet(getRerunLinkUpdateStatusApiUrl(courseId)).reply(() => {
      getStatusCalls += 1;
      return [200, { status: 'Succeeded', results: [] }];
    });

    const { result } = renderHook(() => useUpdateAllPreviousRunLinks(courseId), {
      wrapper: makeQueryClientWrapper(queryClient),
    });
    await expect(result.current.mutateAsync()).resolves.toEqual({ status: 'Pending' });

    expect(getStatusCalls).toBe(1);
    expect(queryClient.getQueryData(queryKey)).toEqual({ status: 'Succeeded', results: [] });
  });

  it('does not accept a stale terminal status matching the pre-mutation cache entry', async () => {
    const { axiosMock, queryClient } = initializeMocks();
    const queryKey = courseOptimizerQueryKeys.rerunLinkUpdateStatus(courseId);
    queryClient.setQueryData(queryKey, { status: 'Succeeded' as const, results: [] });
    axiosMock.onPost(postRerunLinkUpdateApiUrl(courseId)).reply(200, { status: 'Pending' });
    let getStatusCalls = 0;
    axiosMock.onGet(getRerunLinkUpdateStatusApiUrl(courseId)).reply(() => {
      getStatusCalls += 1;
      return getStatusCalls === 1
        ? [200, { status: 'Succeeded', results: [] }]
        : [200, { status: 'Pending', results: [] }];
    });

    const { result } = renderHook(() => useUpdateAllPreviousRunLinks(courseId), {
      wrapper: makeQueryClientWrapper(queryClient),
    });
    await expect(result.current.mutateAsync()).resolves.toEqual({ status: 'Pending' });

    expect(getStatusCalls).toBe(2);
    expect(queryClient.getQueryData(queryKey)).toEqual({ status: 'Pending', results: [] });
  });

  it('does not retry a status-fetch error during mutation handoff', async () => {
    const { axiosMock, queryClient } = initializeMocks();
    const queryKey = courseOptimizerQueryKeys.rerunLinkUpdateStatus(courseId);
    const previous = { status: 'Succeeded' as const, results: [] };
    queryClient.setQueryData(queryKey, previous);
    axiosMock.onPost(postRerunLinkUpdateApiUrl(courseId)).reply(200, { status: 'Pending' });
    axiosMock.onGet(getRerunLinkUpdateStatusApiUrl(courseId)).reply(500);

    const { result } = renderHook(() => useUpdateAllPreviousRunLinks(courseId), {
      wrapper: makeQueryClientWrapper(queryClient),
    });
    await expect(result.current.mutateAsync()).rejects.toThrow('Request failed');

    expect(axiosMock.history.get).toHaveLength(1);
    expect(queryClient.getQueryData(queryKey)).toEqual(previous);
  });

  it('restores link-check cache when starting a scan fails', async () => {
    const { axiosMock, queryClient } = initializeMocks();
    const previous = {
      linkCheckStatus: 'Succeeded' as const,
      linkCheckOutput: { sections: [] },
      linkCheckCreatedAt: '2024-01-01',
    };
    queryClient.setQueryData(courseOptimizerQueryKeys.linkCheckStatus(courseId), previous);
    axiosMock.onPost(postLinkCheckCourseApiUrl(courseId)).reply(500);

    const { result } = renderHook(() => useStartLinkCheck(courseId), {
      wrapper: makeQueryClientWrapper(queryClient),
    });
    await expect(result.current.mutateAsync()).rejects.toThrow('Request failed');

    expect(queryClient.getQueryData(courseOptimizerQueryKeys.linkCheckStatus(courseId))).toEqual(previous);
  });

  it('restores rerun cache when updating all links fails', async () => {
    const { axiosMock, queryClient } = initializeMocks();
    const previous = { status: 'Succeeded' as const, results: [] };
    queryClient.setQueryData(courseOptimizerQueryKeys.rerunLinkUpdateStatus(courseId), previous);
    axiosMock.onPost(postRerunLinkUpdateApiUrl(courseId)).reply(500);

    const { result } = renderHook(() => useUpdateAllPreviousRunLinks(courseId), {
      wrapper: makeQueryClientWrapper(queryClient),
    });
    await expect(result.current.mutateAsync()).rejects.toThrow('Request failed');

    expect(queryClient.getQueryData(courseOptimizerQueryKeys.rerunLinkUpdateStatus(courseId))).toEqual(previous);
  });

  it.each([
    ['update-all', useUpdateAllPreviousRunLinks],
    ['single-link', useUpdateSinglePreviousRunLink],
  ])('removes the optimistic rerun cache when %s fails with no prior data', async (_name, hook) => {
    const { axiosMock, queryClient } = initializeMocks();
    axiosMock.onPost(postRerunLinkUpdateApiUrl(courseId)).reply(500);

    const { result } = renderHook(() => hook(courseId), { wrapper: makeQueryClientWrapper(queryClient) });
    const variables = { linkUrl: 'https://old.example.com', blockId: 'block-1', contentType: 'html' };
    await expect(result.current.mutateAsync(variables as never)).rejects.toThrow('Request failed');

    expect(queryClient.getQueryData(courseOptimizerQueryKeys.rerunLinkUpdateStatus(courseId))).toBeUndefined();
  });

  it('removes the optimistic link-check cache when starting a scan fails with no prior data', async () => {
    const { axiosMock, queryClient } = initializeMocks();
    axiosMock.onPost(postLinkCheckCourseApiUrl(courseId)).reply(500);

    const { result } = renderHook(() => useStartLinkCheck(courseId), {
      wrapper: makeQueryClientWrapper(queryClient),
    });
    await expect(result.current.mutateAsync()).rejects.toThrow('Request failed');

    expect(queryClient.getQueryData(courseOptimizerQueryKeys.linkCheckStatus(courseId))).toBeUndefined();
  });

  it('updates a single previous-run link', async () => {
    const { axiosMock, queryClient } = initializeMocks();
    axiosMock.onPost(postRerunLinkUpdateApiUrl(courseId)).reply(200, { status: 'Pending' });
    axiosMock.onGet(getRerunLinkUpdateStatusApiUrl(courseId)).reply(200, { status: 'Pending', results: [] });

    const { result } = renderHook(() => useUpdateSinglePreviousRunLink(courseId), {
      wrapper: makeQueryClientWrapper(queryClient),
    });
    await result.current.mutateAsync({ linkUrl: 'https://old.example.com', blockId: 'block-1', contentType: 'html' });

    expect(queryClient.getQueryData(courseOptimizerQueryKeys.rerunLinkUpdateStatus(courseId))).toEqual({
      status: 'Pending',
      results: [],
    });
    expect(JSON.parse(axiosMock.history.post[0].data)).toEqual({
      action: 'single',
      data: [{ id: 'block-1', type: 'html', url: 'https://old.example.com' }],
    });
  });
});
