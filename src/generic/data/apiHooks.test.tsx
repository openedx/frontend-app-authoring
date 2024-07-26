import React from 'react';
import { initializeMockApp } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react-hooks';
import MockAdapter from 'axios-mock-adapter';

import { getTagsCountApiUrl } from './api';
import { useContentTagsCount } from './apiHooks';

let axiosMock;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

describe('useContentTagsCount', () => {
  beforeEach(() => {
    initializeMockApp({
      authenticatedUser: {
        userId: 3,
        username: 'abc123',
        administrator: true,
        roles: [],
      },
    });
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
  });

  afterEach(() => {
    jest.clearAllMocks();
    axiosMock.restore();
  });

  it('should return success response', async () => {
    const courseId = 'course-v1:edX+TestX+Test_Course';
    axiosMock.onGet(getTagsCountApiUrl(courseId)).reply(200, { [courseId]: 10 });

    const hook = renderHook(() => useContentTagsCount(courseId), { wrapper });
    await hook.waitForNextUpdate();
    const { data, isSuccess } = hook.result.current;

    expect(axiosMock.history.get[0].url).toEqual(getTagsCountApiUrl(courseId));
    expect(isSuccess).toEqual(true);
    expect(data).toEqual(10);
  });

  it('should return failure response', async () => {
    const courseId = 'course-v1:edX+TestX+Test_Course';
    axiosMock.onGet(getTagsCountApiUrl(courseId)).reply(500, 'error');

    const hook = renderHook(() => useContentTagsCount(courseId), { wrapper });
    await hook.waitForNextUpdate();

    const { isSuccess } = hook.result.current;

    expect(axiosMock.history.get[0].url).toEqual(getTagsCountApiUrl(courseId));
    expect(isSuccess).toEqual(false);
  });

  it('should use an wildcard if a block is provided', async () => {
    const blockId = 'block-v1:edX+TestX+Test_Course+type@chapter+block@123';
    const pattern = 'block-v1:edX+TestX+Test_Course*';
    axiosMock.onGet(getTagsCountApiUrl(pattern)).reply(200, {
      [blockId]: 10,
      'block-v1:edX+TestX+Test_Course+type@chapter+block@another_block': 5,
    });

    const hook = renderHook(() => useContentTagsCount(blockId), { wrapper });
    await hook.waitForNextUpdate();

    const { data, isSuccess } = hook.result.current;

    expect(axiosMock.history.get[0].url).toEqual(getTagsCountApiUrl(pattern));
    expect(isSuccess).toEqual(true);
    expect(data).toEqual(10);
  });

  it('shouldnt call api if no pattern is provided', () => {
    const hook = renderHook(() => useContentTagsCount(undefined), { wrapper });

    hook.rerender();

    const { isSuccess } = hook.result.current;

    expect(axiosMock.history.get.length).toEqual(0);
    expect(isSuccess).toEqual(false);
  });
});
