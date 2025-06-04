import {
  initializeMocks,
  cleanup,
  screen,
  render,
  waitFor,
} from '../testUtils';
import { useWaffleFlags } from './apiHooks';
import { getApiWaffleFlagsUrl } from './api';

// A little component for testing our waffle flag hooks.
const FlagComponent = ({ courseId }: { courseId?: string }) => {
  const waffleFlags = useWaffleFlags(courseId);
  return (
    <ul>
      <li aria-label="isLoading">{waffleFlags.isLoading ? 'loading' : 'false'}</li>
      <li aria-label="isError">{waffleFlags.isError ? 'error' : 'false'}</li>
      <li aria-label="useNewCourseOutlinePage">{waffleFlags.useNewCourseOutlinePage ? 'enabled' : 'disabled'}</li>
    </ul>
  );
};

describe('useWaffleFlags', () => {
  it('uses the default values while the waffle flags are loaded from the server', async () => {
    const { axiosMock } = initializeMocks();
    // Simulate an actual slow response from the Waffle Flags REST API:
    let resolveResponse;
    const promise = new Promise<[number, unknown]>(resolve => { resolveResponse = resolve; });
    axiosMock.onGet(getApiWaffleFlagsUrl()).reply(() => promise);

    render(<FlagComponent />);
    expect(screen.getByLabelText('isLoading')).toHaveTextContent('loading');
    expect(screen.getByLabelText('isError')).toHaveTextContent('false');
    // The default should be enabled, even before we hear back from the server:
    expect(screen.getByLabelText('useNewCourseOutlinePage')).toHaveTextContent('enabled');

    // Then, the server responds with a new value:
    resolveResponse([200, { useNewCourseOutlinePage: false }]);

    // Now, we're no longer loading and we have the new value:
    await waitFor(() => {
      expect(screen.getByLabelText('isLoading')).toHaveTextContent('false');
    });
    expect(screen.getByLabelText('isError')).toHaveTextContent('false');
    expect(screen.getByLabelText('useNewCourseOutlinePage')).toHaveTextContent('disabled');
  });

  it('uses the default values if there\'s an error', async () => {
    const { axiosMock } = initializeMocks();
    // Simulate an actual slow response from the Waffle Flags REST API:
    let resolveResponse;
    const promise = new Promise<[number, unknown]>(resolve => { resolveResponse = resolve; });
    axiosMock.onGet(getApiWaffleFlagsUrl()).reply(() => promise);

    render(<FlagComponent />);
    expect(screen.getByLabelText('isLoading')).toHaveTextContent('loading');
    expect(screen.getByLabelText('isError')).toHaveTextContent('false');
    // The default should be enabled, even before we hear back from the server:
    expect(screen.getByLabelText('useNewCourseOutlinePage')).toHaveTextContent('enabled');

    // Then, the server responds with an error
    resolveResponse([500, {}]);

    // Now, we're no longer loading, we have an error state, and we still have the default value:
    await waitFor(() => {
      expect(screen.getByLabelText('isLoading')).toHaveTextContent('false');
    });
    expect(screen.getByLabelText('isError')).toHaveTextContent('error');
    expect(screen.getByLabelText('useNewCourseOutlinePage')).toHaveTextContent('enabled');
  });

  it('uses the global flag values while loading the course-specific flags', async () => {
    const { axiosMock } = initializeMocks();
    const courseId = 'course-v1:A+b+C';
    // Set the global flag OFF:
    axiosMock.onGet(getApiWaffleFlagsUrl()).reply(200, { useNewCourseOutlinePage: false });
    // Control when we respond with the course-specific flag value:
    let resolveResponse;
    const promise = new Promise<[number, unknown]>(resolve => { resolveResponse = resolve; });
    axiosMock.onGet(getApiWaffleFlagsUrl(courseId)).reply(() => promise);

    // Check the global flag:
    render(<FlagComponent />);
    await waitFor(() => {
      // Once it loads the flags from the server, the global 'false' value will override the default 'true':
      expect(screen.getByLabelText('useNewCourseOutlinePage')).toHaveTextContent('disabled');
    });

    // Now check the course-specific flag:
    cleanup();
    render(<FlagComponent courseId={courseId} />);

    // Now, the course-specific value is loading but in the meantime we use the global default:
    expect(screen.getByLabelText('isLoading')).toHaveTextContent('loading');
    expect(screen.getByLabelText('isError')).toHaveTextContent('false');
    expect(screen.getByLabelText('useNewCourseOutlinePage')).toHaveTextContent('disabled');

    // Now the server responds: the course-specific flag is ON:
    resolveResponse([200, { useNewCourseOutlinePage: true }]);
    await waitFor(() => {
      expect(screen.getByLabelText('isLoading')).toHaveTextContent('false');
    });
    expect(screen.getByLabelText('isError')).toHaveTextContent('false');
    expect(screen.getByLabelText('useNewCourseOutlinePage')).toHaveTextContent('enabled');
  });
});
