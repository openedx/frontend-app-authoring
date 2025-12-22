import { initializeMockApp } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MockAdapter from 'axios-mock-adapter';
import { renderHook, waitFor } from '@testing-library/react';
import { courseLegacyLibraryContentBlocks, courseLegacyLibraryContentTaskStatus, getEntityLinksByDownstreamContextUrl } from './api';
import { useCheckMigrateCourseLegacyLibReadyToMigrateBlocksOptions, useCourseLegacyLibReadyToMigrateBlocks, useEntityLinks } from './apiHooks';

let axiosMock: MockAdapter;

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

describe('course libraries api hooks', () => {
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
    axiosMock.reset();
  });

  it('should return component links for course', async () => {
    const courseId = 'course-v1:some+key';
    const url = getEntityLinksByDownstreamContextUrl();
    axiosMock.onGet(url).reply(200, []);
    const { result } = renderHook(() => useEntityLinks({ courseId, contentType: 'components' }), { wrapper });
    await waitFor(() => {
      expect(result.current.isLoading).toBeFalsy();
    });
    expect(axiosMock.history.get[0].url).toEqual(url);
    expect(axiosMock.history.get[0].params).toEqual({
      course_id: courseId,
      ready_to_sync: undefined,
      upstream_key: undefined,
      no_page: true,
      item_type: 'components',
    });
  });

  it('should return links for course', async () => {
    const courseId = 'course-v1:some+key';
    const url = getEntityLinksByDownstreamContextUrl();
    axiosMock.onGet(url).reply(200, []);
    const { result } = renderHook(() => useEntityLinks({ courseId }), { wrapper });
    await waitFor(() => {
      expect(result.current.isLoading).toBeFalsy();
    });
    expect(axiosMock.history.get[0].url).toEqual(url);
    expect(axiosMock.history.get[0].params).toEqual({
      course_id: courseId,
      ready_to_sync: undefined,
      upstream_usage_key: undefined,
      no_page: true,
      content_type: undefined,
    });
  });

  it('should return ready to migrate blocks', async () => {
    const courseId = 'course-v1:some+key';
    const url = courseLegacyLibraryContentBlocks(courseId);
    axiosMock.onGet(url).reply(200, []);
    const { result } = renderHook(() => useCourseLegacyLibReadyToMigrateBlocks(courseId), { wrapper });
    await waitFor(() => {
      expect(result.current.isLoading).toBeFalsy();
    });
    expect(axiosMock.history.get[0].url).toEqual(url);
  });

  it('should check tasks status', async () => {
    const courseId = 'course-v1:some+key';
    const taskId = 'some-id';
    const uuid = '1f8831dd-6f90-48df-a503-c0d0e957a331';
    const url = courseLegacyLibraryContentTaskStatus(courseId, taskId);
    axiosMock.onGet(url).reply(200, {
      task_id: 'some-id',
      status: 'Succeeded',
      status_text: 'Succeeded',
      uuid,
    });
    const { result } = renderHook(() => useCheckMigrateCourseLegacyLibReadyToMigrateBlocksOptions(courseId, taskId), {
      wrapper,
    });
    await waitFor(() => {
      expect(result.current.isLoading).toBeFalsy();
    });
    expect(axiosMock.history.get[0].url).toEqual(url);
    expect(result.current.data?.uuid).toEqual(uuid);
  });
});
