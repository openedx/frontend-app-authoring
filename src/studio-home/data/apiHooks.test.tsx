import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { makeQueryClientWrapper } from '@src/testUtils';
import type { StudioHomeCoursesV2Response } from './api';
import { getStudioHomeCoursesV2 } from './api';
import { studioHomeQueryKeys, useStudioHomeCoursesV2 } from './apiHooks';

jest.mock('./api');

const mockResponse: StudioHomeCoursesV2Response = {
  results: {
    courses: [
      {
        courseKey: 'course-v1:HarvardX+123+2023',
        displayName: 'Managing Risk in the Information Age',
        lmsLink:
          '//localhost:18000/courses/course-v1:HarvardX+123+2023/jump_to/block-v1:HarvardX+123+2023+type@course+block@course',
        number: '123',
        org: 'HarvardX',
        rerunLink: '/course_rerun/course-v1:HarvardX+123+2023',
        run: '2023',
        url: '/course/course-v1:HarvardX+123+2023',
      },
    ],
  },
  numPages: 1,
  count: 1,
};

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return { wrapper: makeQueryClientWrapper(queryClient), queryClient };
};

describe('useStudioHomeCoursesV2', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getStudioHomeCoursesV2 as jest.Mock).mockResolvedValue(mockResponse);
  });

  it('calls getStudioHomeCoursesV2 with the raw querystring and the params passed in', async () => {
    const { wrapper } = createWrapper();
    const params = { page: 2, search: 'physics' };

    const { result } = renderHook(() => useStudioHomeCoursesV2(params), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(getStudioHomeCoursesV2).toHaveBeenCalledTimes(1);
    expect(getStudioHomeCoursesV2).toHaveBeenCalledWith('', params);
  });

  it('resolves data matching the StudioHomeCoursesV2Response shape', async () => {
    const { wrapper } = createWrapper();
    const params = { page: 1 };

    const { result } = renderHook(() => useStudioHomeCoursesV2(params), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockResponse);
    expect(result.current.data?.results.courses).toEqual(mockResponse.results.courses);
    expect(result.current.data?.numPages).toBe(1);
    expect(result.current.data?.count).toBe(1);
  });

  it('produces a different query key when params differ', () => {
    const paramsA = { page: 1, search: 'physics' };
    const paramsB = { page: 2, search: 'physics' };

    const keyA = studioHomeQueryKeys.coursesV2(paramsA);
    const keyB = studioHomeQueryKeys.coursesV2(paramsB);

    expect(keyA).not.toEqual(keyB);
  });

  it('populates separate cache entries for two different params objects', async () => {
    const { wrapper, queryClient } = createWrapper();
    const paramsA = { page: 1, search: 'physics' };
    const paramsB = { page: 2, search: 'physics' };

    // Resolve with a value that depends on the params, so the two cache entries
    // can be told apart by content, not just by object identity.
    (getStudioHomeCoursesV2 as jest.Mock).mockImplementation(
      (_search: string, params: { page: number; }) => Promise.resolve({ ...mockResponse, count: params.page }),
    );

    const { result: resultA } = renderHook(() => useStudioHomeCoursesV2(paramsA), { wrapper });
    const { result: resultB } = renderHook(() => useStudioHomeCoursesV2(paramsB), { wrapper });

    await waitFor(() => {
      expect(resultA.current.isSuccess).toBe(true);
      expect(resultB.current.isSuccess).toBe(true);
    });

    expect(getStudioHomeCoursesV2).toHaveBeenCalledTimes(2);
    expect(getStudioHomeCoursesV2).toHaveBeenNthCalledWith(1, '', paramsA);
    expect(getStudioHomeCoursesV2).toHaveBeenNthCalledWith(2, '', paramsB);
    expect(queryClient.getQueryData(studioHomeQueryKeys.coursesV2(paramsA)))
      .not.toEqual(queryClient.getQueryData(studioHomeQueryKeys.coursesV2(paramsB)));
  });

  it('does not fire the query when options.enabled is false', async () => {
    const { wrapper } = createWrapper();
    const params = { page: 1 };

    const { result } = renderHook(() => useStudioHomeCoursesV2(params, { enabled: false }), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.fetchStatus).toBe('idle');
    expect(getStudioHomeCoursesV2).not.toHaveBeenCalled();
  });
});
