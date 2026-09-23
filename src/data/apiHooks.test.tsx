import { renderHook } from '@testing-library/react';
import { useRef } from 'react';
import userEvent from '@testing-library/user-event';

import {
  initializeMocks,
  cleanup,
  screen,
  render,
  waitFor,
  makeQueryClientWrapper,
} from '../testUtils';
import {
  useWaffleFlags,
  useCourseApps,
  useUpdateCourseAppStatus,
  createGlobalState,
  useUpdateCourseAdvancedSettings,
  useSortedCourseApps,
} from './apiHooks';
import { RequestStatus } from './constants';
import { getApiWaffleFlagsUrl, getCourseAppsApiUrl, getCourseAdvancedSettingsApiUrl } from './api';

const courseId = 'course-v1:edX+DemoX+Demo_Course';

// A little component for testing our waffle flag hooks.
const FlagComponent = ({ courseId }: { courseId?: string; }) => {
  const waffleFlags = useWaffleFlags(courseId);
  return (
    <ul>
      <li aria-label="isLoading">{waffleFlags.isLoading ? 'loading' : 'false'}</li>
      <li aria-label="isError">{waffleFlags.isError ? 'error' : 'false'}</li>
      <li aria-label="useReactMarkdownEditor">{waffleFlags.useReactMarkdownEditor ? 'enabled' : 'disabled'}</li>
    </ul>
  );
};

describe('useWaffleFlags', () => {
  it('uses the default values while the waffle flags are loaded from the server', async () => {
    const { axiosMock } = initializeMocks();
    // Simulate an actual slow response from the Waffle Flags REST API:
    let resolveResponse;
    const promise = new Promise<[number, unknown]>(resolve => {
      resolveResponse = resolve;
    });
    axiosMock.onGet(getApiWaffleFlagsUrl()).reply(() => promise);

    render(<FlagComponent />);
    expect(await screen.findByLabelText('isLoading')).toHaveTextContent('loading');
    expect(await screen.findByLabelText('isError')).toHaveTextContent('false');
    // The default should be enabled, even before we hear back from the server:
    expect(await screen.findByLabelText('useReactMarkdownEditor')).toHaveTextContent('enabled');

    // Then, the server responds with a new value:
    resolveResponse([200, { useReactMarkdownEditor: false }]);

    // Now, we're no longer loading and we have the new value:
    await waitFor(async () => {
      expect(await screen.findByLabelText('isLoading')).toHaveTextContent('false');
    });
    expect(await screen.findByLabelText('isError')).toHaveTextContent('false');
    expect(await screen.findByLabelText('useReactMarkdownEditor')).toHaveTextContent('disabled');
  });

  it('uses the default values if there\'s an error', async () => {
    const { axiosMock } = initializeMocks();
    // Simulate an actual slow response from the Waffle Flags REST API:
    let resolveResponse;
    const promise = new Promise<[number, unknown]>(resolve => {
      resolveResponse = resolve;
    });
    axiosMock.onGet(getApiWaffleFlagsUrl()).reply(() => promise);

    render(<FlagComponent />);
    expect(await screen.findByLabelText('isLoading')).toHaveTextContent('loading');
    expect(await screen.findByLabelText('isError')).toHaveTextContent('false');
    // The default should be enabled, even before we hear back from the server:
    expect(await screen.findByLabelText('useReactMarkdownEditor')).toHaveTextContent('enabled');

    // Then, the server responds with an error
    resolveResponse([500, {}]);

    // Now, we're no longer loading, we have an error state, and we still have the default value:
    await waitFor(async () => {
      expect(await screen.findByLabelText('isLoading')).toHaveTextContent('false');
    });
    expect(await screen.findByLabelText('isError')).toHaveTextContent('error');
    expect(await screen.findByLabelText('useReactMarkdownEditor')).toHaveTextContent('enabled');
  });

  it('uses the global flag values while loading the course-specific flags', async () => {
    const { axiosMock } = initializeMocks();
    const courseId = 'course-v1:A+b+C';
    // Set the global flag OFF:
    axiosMock.onGet(getApiWaffleFlagsUrl()).reply(200, { useReactMarkdownEditor: false });
    // Control when we respond with the course-specific flag value:
    let resolveResponse;
    const promise = new Promise<[number, unknown]>(resolve => {
      resolveResponse = resolve;
    });
    axiosMock.onGet(getApiWaffleFlagsUrl(courseId)).reply(() => promise);

    // Check the global flag:
    render(<FlagComponent />);
    await waitFor(async () => {
      // Once it loads the flags from the server, the global 'false' value will override the default 'true':
      expect(await screen.findByLabelText('useReactMarkdownEditor')).toHaveTextContent('disabled');
    });

    // Now check the course-specific flag:
    cleanup();
    render(<FlagComponent courseId={courseId} />);

    // Now, the course-specific value is loading but in the meantime we use the global default:
    expect(await screen.findByLabelText('isLoading')).toHaveTextContent('loading');
    expect(await screen.findByLabelText('isError')).toHaveTextContent('false');
    expect(await screen.findByLabelText('useReactMarkdownEditor')).toHaveTextContent('disabled');

    // Now the server responds: the course-specific flag is ON:
    resolveResponse([200, { useReactMarkdownEditor: true }]);
    await waitFor(async () => {
      expect(await screen.findByLabelText('isLoading')).toHaveTextContent('false');
    });
    expect(await screen.findByLabelText('isError')).toHaveTextContent('false');
    expect(await screen.findByLabelText('useReactMarkdownEditor')).toHaveTextContent('enabled');
  });
});

describe('useUpdateCourseAppStatus', () => {
  it('sends a PATCH request and invalidates the course apps query on success', async () => {
    const { axiosMock, queryClient } = initializeMocks();
    axiosMock.onPatch(`${getCourseAppsApiUrl()}/${courseId}`).reply(200);
    const invalidateQueriesSpy = jest.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(
      () => useUpdateCourseAppStatus(courseId),
      { wrapper: makeQueryClientWrapper(queryClient) },
    );

    result.current.mutate({ appId: 'discussion', state: true });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(axiosMock.history.patch[0].url).toBe(`${getCourseAppsApiUrl()}/${courseId}`);
    expect(JSON.parse(axiosMock.history.patch[0].data)).toEqual({ id: 'discussion', enabled: true });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['courseApps', courseId] });
  });
});

describe('useCourseApps', () => {
  it('sorts course apps according to their display order', async () => {
    const { axiosMock, queryClient } = initializeMocks();
    axiosMock.onGet(`${getCourseAppsApiUrl()}/${courseId}`).reply(200, [
      {
        id: 'wiki',
        name: 'Wiki',
        description: '',
        enabled: true,
        allowed_operations: { enable: true, configure: true },
      },
      {
        id: 'discussion',
        name: 'Discussion',
        description: '',
        enabled: true,
        allowed_operations: { enable: true, configure: true },
      },
    ]);

    const { result } = renderHook(
      () => useCourseApps(courseId),
      { wrapper: makeQueryClientWrapper(queryClient) },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.map(app => app.id)).toEqual(['discussion', 'wiki']);
  });
});

describe('useSortedCourseApps', () => {
  it('reports a denied status on a 403 response', async () => {
    const { axiosMock, queryClient } = initializeMocks();
    axiosMock.onGet(`${getCourseAppsApiUrl()}/${courseId}`).reply(403);

    const { result } = renderHook(
      () => useSortedCourseApps(courseId),
      { wrapper: makeQueryClientWrapper(queryClient) },
    );

    await waitFor(() => expect(result.current.courseAppsStatus).toBe(RequestStatus.DENIED));
    expect(result.current.courseApps).toEqual([]);
  });

  it('reports a failed status on a non-403 error response', async () => {
    const { axiosMock, queryClient } = initializeMocks();
    axiosMock.onGet(`${getCourseAppsApiUrl()}/${courseId}`).reply(500);

    const { result } = renderHook(
      () => useSortedCourseApps(courseId),
      { wrapper: makeQueryClientWrapper(queryClient) },
    );

    await waitFor(() => expect(result.current.courseAppsStatus).toBe(RequestStatus.FAILED));
    expect(result.current.courseApps).toEqual([]);
  });
});

describe('useUpdateCourseAdvancedSettings', () => {
  it('sends a PATCH request and invalidates the course settings and apps queries on success', async () => {
    const { axiosMock, queryClient } = initializeMocks();
    axiosMock.onPatch(`${getCourseAdvancedSettingsApiUrl()}/${courseId}`).reply(200, {});
    const invalidateQueriesSpy = jest.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(
      () => useUpdateCourseAdvancedSettings(courseId),
      { wrapper: makeQueryClientWrapper(queryClient) },
    );

    result.current.mutate({ setting: 'courseDisplayName', value: 'New Name' });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(axiosMock.history.patch[0].url).toBe(`${getCourseAdvancedSettingsApiUrl()}/${courseId}`);
    expect(JSON.parse(axiosMock.history.patch[0].data)).toEqual({ course_display_name: { value: 'New Name' } });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['courseSettings', courseId] });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['courseApps', courseId] });
  });
});

// A little component for testing the global state hooks.
const useCounter = createGlobalState<{ count: number; }>(() => ['test', 'counter'], { count: 0 });

const CounterComponent = () => {
  const { data, setData, resetData } = useCounter();
  const firstSetData = useRef(setData);
  const firstResetData = useRef(resetData);
  const callbacksKeptIdentity = setData === firstSetData.current && resetData === firstResetData.current;

  return (
    <ul>
      <li aria-label="count">{data?.count ?? 'none'}</li>
      <li aria-label="callbacks">{callbacksKeptIdentity ? 'same' : 'recreated'}</li>
      <li>
        <button type="button" onClick={() => setData({ count: (data?.count ?? 0) + 1 })}>increment</button>
      </li>
      <li>
        <button
          type="button"
          onClick={() => {
            void resetData();
          }}
        >
          reset
        </button>
      </li>
    </ul>
  );
};

describe('createGlobalState', () => {
  it('keeps its callbacks across renders, so effects depending on them do not re-run', async () => {
    const user = userEvent.setup();
    initializeMocks();
    render(<CounterComponent />);
    await waitFor(() => expect(screen.getByLabelText('count')).toHaveTextContent('0'));

    await user.click(screen.getByRole('button', { name: 'increment' }));
    await waitFor(() => expect(screen.getByLabelText('count')).toHaveTextContent('1'));

    expect(screen.getByLabelText('callbacks')).toHaveTextContent('same');
  });

  it('resets the value it stores', async () => {
    const user = userEvent.setup();
    initializeMocks();
    render(<CounterComponent />);
    await waitFor(() => expect(screen.getByLabelText('count')).toHaveTextContent('0'));

    await user.click(screen.getByRole('button', { name: 'increment' }));
    await waitFor(() => expect(screen.getByLabelText('count')).toHaveTextContent('1'));

    await user.click(screen.getByRole('button', { name: 'reset' }));
    await waitFor(() => expect(screen.getByLabelText('count')).toHaveTextContent('0'));
  });
});
