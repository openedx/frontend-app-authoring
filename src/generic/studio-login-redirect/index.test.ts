import { getConfig } from '@edx/frontend-platform';
import { getAuthService, getAuthenticatedHttpClient, getHttpClient } from '@edx/frontend-platform/auth';
import type MockAdapter from 'axios-mock-adapter';

import { initializeMocks, waitFor } from '@src/testUtils';
import {
  HOLD_REQUESTS_MS,
  LAST_REDIRECT_KEY,
  REDIRECT_COOLDOWN_MS,
  STUDIO_CHECK_TIMEOUT_MS,
  WAIT_FOR_SENT_REQUESTS_MS,
  addStudioLoginRedirectInterceptor,
  isStudioUnauthorizedError,
  redirectToStudioLogin,
  resetStudioLoginRedirect,
  shouldRetryQuery,
} from '.';

const originalLocation = window.location;
const originalFetch = global.fetch;
const pageUrl = 'http://localhost/course/course-v1:org+101+run';

/** What the session check and the silent sign-in see. */
const initialStudio = {
  hasSession: false,
  lmsSignedIn: true,
  checkFails: false,
  /** Studio answers the session check with 401 instead of a redirect (the platform change). */
  checkAnswers401: false,
  checkStalls: false,
  signInStalls: false,
  signInDone: Promise.resolve(),
};
const studio = { ...initialStudio };

/** A request that never gets an answer, until it is aborted. */
const stall = (init?: RequestInit) =>
  new Promise((_resolve, reject) => {
    init?.signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')));
  });

/** A `fetch` response, as far as axios reads it. */
const fetchResponse = (type: ResponseType, status: number) => ({ type, status, text: async () => '' });

const mockStudioFetch = () => {
  global.fetch = jest.fn(async (_url: string, init?: RequestInit) => {
    if (init?.mode === 'no-cors') {
      // The silent sign-in: Studio's login creates a session if the user is signed in to the LMS.
      if (studio.signInStalls) {
        return stall(init);
      }
      await studio.signInDone;
      studio.hasSession = studio.lmsSignedIn;
      return fetchResponse('opaque', 0);
    }
    if (studio.checkStalls) {
      return stall(init);
    }
    if (studio.checkFails) {
      throw new TypeError('Failed to fetch');
    }
    if (studio.hasSession) {
      return fetchResponse('cors', 400);
    }
    return studio.checkAnswers401 ? fetchResponse('cors', 401) : fetchResponse('opaqueredirect', 0);
  }) as unknown as typeof fetch;
  // axios found no `fetch` when it loaded (jsdom has none): its `fetch` adapter uses this one instead.
  getHttpClient().defaults.env = { ...getHttpClient().defaults.env, fetch: global.fetch };
};

const signInRequests = () => (global.fetch as jest.Mock).mock.calls.filter(([, init]) => init?.mode === 'no-cors');

/** Lets pending promise callbacks (interceptors, the session check) run. */
const flushPromises = () =>
  new Promise((resolve) => {
    setTimeout(resolve, 0);
  });

/** Follows a request without waiting for it, as a held request does not settle. */
const track = (request: Promise<unknown>) => {
  const state: { settled: boolean; error?: any; } = { settled: false };
  request.then(
    () => {
      state.settled = true;
    },
    (error) => {
      state.settled = true;
      state.error = error;
    },
  );
  return state;
};

describe('studio login redirect', () => {
  let axiosMock: MockAdapter;
  let assign: jest.Mock;
  let removeInterceptors: () => void;
  const studioUrl = (path: string) => `${getConfig().STUDIO_BASE_URL}${path}`;
  const get = (path: string) => getAuthenticatedHttpClient().get(studioUrl(path));
  const post = (path: string) => getAuthenticatedHttpClient().post(studioUrl(path));
  /** A Studio view that needs the session: the first request fails without one, the next one works. */
  const failOnceWithoutSession = (method: 'onGet' | 'onPost', path: string, failure: 'network' | 401 = 'network') => {
    const handler = axiosMock[method](studioUrl(path));
    if (failure === 'network') {
      handler.networkErrorOnce();
    } else {
      handler.replyOnce(failure);
    }
    axiosMock[method](studioUrl(path)).reply(200, { path });
  };
  /** A request that gets no response once the returned function is called, e.g. after Studio's redirect. */
  const failLater = (method: 'onGet' | 'onPost', path: string) => {
    let failNow: () => void = () => {};
    axiosMock[method](studioUrl(path)).replyOnce((config) =>
      new Promise((_resolve, reject) => {
        failNow = () => reject(Object.assign(new Error('Network Error'), { config, code: 'ERR_NETWORK' }));
      })
    );
    return () => failNow();
  };

  beforeEach(() => {
    ({ axiosMock } = initializeMocks());
    assign = jest.fn();
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { href: pageUrl, assign },
    });
    window.sessionStorage.clear();
    resetStudioLoginRedirect();
    Object.assign(studio, initialStudio);
    mockStudioFetch();
    removeInterceptors = addStudioLoginRedirectInterceptor();
  });

  afterEach(() => {
    removeInterceptors();
    Object.defineProperty(window, 'location', { configurable: true, value: originalLocation });
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  describe('when the user is still signed in to the LMS', () => {
    it('signs in to Studio without leaving the page and sends the failed request again', async () => {
      failOnceWithoutSession('onGet', '/course_info_update/course-v1:org+101+run/');

      await expect(get('/course_info_update/course-v1:org+101+run/')).resolves.toMatchObject({ status: 200 });

      expect(signInRequests()).toHaveLength(1);
      const loginUrl = new URL(signInRequests()[0][0]);
      expect(loginUrl.pathname).toEqual('/login/');
      expect(loginUrl.searchParams.get('next')).toEqual('/xblock/');
      expect(assign).not.toHaveBeenCalled();
    });

    it('checks the session and signs in through the HTTP client', async () => {
      const clientGet = jest.spyOn(getHttpClient(), 'get');
      failOnceWithoutSession('onGet', '/xblock/block-1');

      await expect(get('/xblock/block-1')).resolves.toMatchObject({ status: 200 });

      const options = { adapter: 'fetch', withCredentials: true, timeout: STUDIO_CHECK_TIMEOUT_MS };
      expect(clientGet).toHaveBeenCalledWith(
        studioUrl('/xblock/'),
        expect.objectContaining({
          ...options,
          fetchOptions: { cache: 'no-store', redirect: 'manual' },
        }),
      );
      expect(clientGet).toHaveBeenCalledWith(
        studioUrl('/login/?next=%2Fxblock%2F'),
        expect.objectContaining({
          ...options,
          fetchOptions: { cache: 'no-store', mode: 'no-cors' },
        }),
      );
    });

    it('does the same for a save that Studio answered with 401', async () => {
      failOnceWithoutSession('onPost', '/xblock/', 401);

      await expect(post('/xblock/')).resolves.toMatchObject({ status: 200 });

      expect(signInRequests()).toHaveLength(1);
      expect(assign).not.toHaveBeenCalled();
    });

    it('forgets the CSRF token that Studio replaced when signing in', async () => {
      const clearCsrfTokenCache = jest.fn();
      getAuthService().getCsrfTokenService = () => ({ clearCsrfTokenCache });
      failOnceWithoutSession('onPost', '/xblock/');

      await expect(post('/xblock/')).resolves.toMatchObject({ status: 200 });

      expect(clearCsrfTokenCache).toHaveBeenCalledTimes(1);
    });

    it('signs in once for many failed requests', async () => {
      const paths = [1, 2, 3].map((id) => `/xblock/block-${id}`);
      paths.forEach((path) => failOnceWithoutSession('onGet', path));

      await expect(Promise.all(paths.map(get))).resolves.toHaveLength(3);

      expect(signInRequests()).toHaveLength(1);
    });

    it('holds back Studio requests made while signing in', async () => {
      let finishSignIn: () => void = () => {};
      studio.signInDone = new Promise((resolve) => {
        finishSignIn = resolve;
      });
      failOnceWithoutSession('onGet', '/xblock/block-1');
      axiosMock.onGet(studioUrl('/xblock/block-2')).reply(200, {});
      const first = get('/xblock/block-1');
      await waitFor(() => expect(signInRequests()).toHaveLength(1));

      const second = get('/xblock/block-2');
      await flushPromises();
      expect(axiosMock.history.get.map((request) => request.url)).not.toContain(studioUrl('/xblock/block-2'));
      finishSignIn();

      await expect(first).resolves.toMatchObject({ status: 200 });
      await expect(second).resolves.toMatchObject({ status: 200 });
    });

    it('treats a 401 from the session check as no session', async () => {
      studio.checkAnswers401 = true;
      failOnceWithoutSession('onGet', '/xblock/block-1');

      await expect(get('/xblock/block-1')).resolves.toMatchObject({ status: 200 });

      expect(signInRequests()).toHaveLength(1);
    });

    it('waits for the Studio requests already sent before signing in', async () => {
      failOnceWithoutSession('onGet', '/xblock/block-1');
      const failSecond = failLater('onGet', '/xblock/block-2');
      axiosMock.onGet(studioUrl('/xblock/block-2')).reply(200, {});
      const first = get('/xblock/block-1');
      const second = get('/xblock/block-2');
      await flushPromises();
      expect(signInRequests()).toHaveLength(0);

      failSecond();

      await expect(Promise.all([first, second])).resolves.toHaveLength(2);
      expect(signInRequests()).toHaveLength(1);
    });

    it('stops waiting for a request sent earlier after a while, and does not send that save again', async () => {
      jest.useFakeTimers();
      try {
        failOnceWithoutSession('onGet', '/xblock/block-1');
        const failSave = failLater('onPost', '/xblock/');
        const save = track(post('/xblock/'));
        const read = track(get('/xblock/block-1'));
        await jest.advanceTimersByTimeAsync(0);
        expect(signInRequests()).toHaveLength(0);

        await jest.advanceTimersByTimeAsync(WAIT_FOR_SENT_REQUESTS_MS);
        await jest.advanceTimersByTimeAsync(0);
        expect(signInRequests()).toHaveLength(1);
        expect(read).toEqual({ settled: true });

        failSave();
        await jest.advanceTimersByTimeAsync(0);

        expect(save.error).toBeDefined();
        expect(axiosMock.history.post).toHaveLength(1);
      } finally {
        jest.useRealTimers();
      }
    });

    it('sends a read again when its 401 arrives after the background sign-in', async () => {
      const apiPath = '/api/contentstore/v1/xblock/block-2';
      failOnceWithoutSession('onGet', '/xblock/block-1');
      axiosMock.onGet(studioUrl(apiPath)).replyOnce(() =>
        new Promise((resolve) => {
          setTimeout(() => resolve([401]), 50);
        })
      );
      axiosMock.onGet(studioUrl(apiPath)).reply(200, {});

      const results = await Promise.all([get('/xblock/block-1'), get(apiPath)]);

      expect(results.map((result) => result.status)).toEqual([200, 200]);
      expect(signInRequests()).toHaveLength(1);
    });

    it('leaves alone a request that got no response when its URL cannot be read', async () => {
      axiosMock.onGet('http://[').networkError();

      await expect(getAuthenticatedHttpClient().get('http://[')).rejects.toBeDefined();

      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('leaves alone a Studio REST API request that got no response', async () => {
      axiosMock.onPost(studioUrl('/api/contentstore/v1/xblock/')).networkError();

      await expect(post('/api/contentstore/v1/xblock/')).rejects.toBeDefined();

      expect(global.fetch).not.toHaveBeenCalled();
      expect(axiosMock.history.post).toHaveLength(1);
    });

    it('does not send again a Studio REST API save that got no response during the background sign-in', async () => {
      let finishSignIn: () => void = () => {};
      studio.signInDone = new Promise((resolve) => {
        finishSignIn = resolve;
      });
      failOnceWithoutSession('onGet', '/xblock/block-1');
      const failSave = failLater('onPost', '/api/contentstore/v1/xblock/');
      const save = post('/api/contentstore/v1/xblock/');
      const read = get('/xblock/block-1');
      await waitFor(() => expect(signInRequests()).toHaveLength(1));

      failSave();
      await expect(save).rejects.toBeDefined();
      finishSignIn();

      await expect(read).resolves.toMatchObject({ status: 200 });
      expect(axiosMock.history.post).toHaveLength(1);
    });

    it('gives up quietly when the background sign-in does not finish', async () => {
      jest.useFakeTimers();
      try {
        studio.signInStalls = true;
        axiosMock.onGet(studioUrl('/xblock/block-1')).networkError();
        axiosMock.onGet(studioUrl('/xblock/block-2')).reply(200, {});
        const failed = track(get('/xblock/block-1'));
        await jest.advanceTimersByTimeAsync(0);
        expect(signInRequests()).toHaveLength(1);
        const queued = track(get('/xblock/block-2'));

        await jest.advanceTimersByTimeAsync(STUDIO_CHECK_TIMEOUT_MS);
        await jest.advanceTimersByTimeAsync(0);

        expect(failed.error).toBeDefined();
        expect(queued.settled).toBe(true);
        expect(queued.error).toBeUndefined();
        expect(assign).not.toHaveBeenCalled();
      } finally {
        jest.useRealTimers();
      }
    });

    it('leaves a failure alone when the session check does not finish', async () => {
      jest.useFakeTimers();
      try {
        studio.checkStalls = true;
        axiosMock.onGet(studioUrl('/xblock/block-1')).networkError();
        const failed = track(get('/xblock/block-1'));

        await jest.advanceTimersByTimeAsync(STUDIO_CHECK_TIMEOUT_MS);
        await jest.advanceTimersByTimeAsync(0);

        expect(failed.error).toBeDefined();
        expect(signInRequests()).toHaveLength(0);
      } finally {
        jest.useRealTimers();
      }
    });

    it('does not send a request a third time', async () => {
      axiosMock.onGet(studioUrl('/xblock/block-1')).networkError();

      await expect(get('/xblock/block-1')).rejects.toBeDefined();

      expect(signInRequests()).toHaveLength(1);
      expect(assign).not.toHaveBeenCalled();
    });

    it('leaves a 401 alone when there is a Studio session', async () => {
      studio.hasSession = true;
      axiosMock.onPost(studioUrl('/api/discussions/v0/course/course-v1:org+101+run/sync_discussion_topics')).reply(401);

      await expect(post('/api/discussions/v0/course/course-v1:org+101+run/sync_discussion_topics'))
        .rejects.toMatchObject({ response: { status: 401 } });

      expect(signInRequests()).toHaveLength(0);
    });

    it.each([403, 404, 500])('leaves a Studio %d alone', async (status) => {
      axiosMock.onGet(studioUrl('/xblock/block-1')).reply(status);

      await expect(get('/xblock/block-1')).rejects.toMatchObject({ response: { status } });

      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('leaves failures of other services alone', async () => {
      const lmsUrl = `${getConfig().LMS_BASE_URL}/login_refresh`;
      axiosMock.onPost(lmsUrl).reply(401);

      await expect(getAuthenticatedHttpClient().post(lmsUrl)).rejects.toMatchObject({ response: { status: 401 } });

      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('does nothing when the session check fails too', async () => {
      studio.checkFails = true;
      axiosMock.onGet(studioUrl('/xblock/block-1')).networkError();

      await expect(get('/xblock/block-1')).rejects.toBeDefined();

      expect(signInRequests()).toHaveLength(0);
      expect(assign).not.toHaveBeenCalled();
    });
  });

  describe('when the user has to sign in to the LMS again', () => {
    beforeEach(() => {
      studio.lmsSignedIn = false;
    });

    it('goes to the Studio login from a page that was loading data, without failing the request', async () => {
      axiosMock.onGet(studioUrl('/xblock/block-1')).networkError();

      const request = track(get('/xblock/block-1'));
      await waitFor(() => expect(assign).toHaveBeenCalledTimes(1));
      await flushPromises();

      const loginUrl = new URL(assign.mock.calls[0][0]);
      expect(loginUrl.origin).toEqual(new URL(getConfig().STUDIO_BASE_URL).origin);
      expect(loginUrl.pathname).toEqual('/login/');
      expect(loginUrl.searchParams.get('next')).toEqual(pageUrl);
      expect(request.settled).toBe(false);
    });

    it('goes to the login once when many requests fail together', async () => {
      const paths = [1, 2, 3, 4, 5].map((id) => `/xblock/block-${id}`);
      paths.forEach((path) => axiosMock.onGet(studioUrl(path)).reply(401));

      paths.forEach((path) => track(get(path)));
      await waitFor(() => expect(assign).toHaveBeenCalled());
      await flushPromises();

      expect(assign).toHaveBeenCalledTimes(1);
      expect(signInRequests()).toHaveLength(1);
    });

    it('goes to the Studio login when a save fails too, without failing the save', async () => {
      axiosMock.onPost(studioUrl('/xblock/')).networkError();

      const request = track(post('/xblock/'));
      await waitFor(() => expect(assign).toHaveBeenCalledTimes(1));
      await flushPromises();

      expect(new URL(assign.mock.calls[0][0]).searchParams.get('next')).toEqual(pageUrl);
      expect(request.settled).toBe(false);
    });

    it('fails the requests when the last login did not restore the session, without sending the waiting ones', async () => {
      window.sessionStorage.setItem(LAST_REDIRECT_KEY, String(Date.now() - REDIRECT_COOLDOWN_MS / 2));
      let finishSignIn: () => void = () => {};
      studio.signInDone = new Promise((resolve) => {
        finishSignIn = resolve;
      });
      axiosMock.onPost(studioUrl('/xblock/')).reply(401);
      axiosMock.onGet(studioUrl('/xblock/block-2')).reply(200, {});
      axiosMock.onPut(studioUrl('/xblock/block-3')).reply(200, {});
      const failed = track(post('/xblock/'));
      await waitFor(() => expect(signInRequests()).toHaveLength(1));
      const queuedRead = track(get('/xblock/block-2'));
      const queuedSave = track(getAuthenticatedHttpClient().put(studioUrl('/xblock/block-3')));
      await flushPromises();

      finishSignIn();
      await waitFor(() => expect(failed.settled && queuedRead.settled && queuedSave.settled).toBe(true));

      expect(failed.error).toMatchObject({ response: { status: 401 } });
      expect(shouldRetryQuery(0, queuedRead.error)).toBe(false);
      expect(queuedSave.error).toBeDefined();
      const sent = [...axiosMock.history.get, ...axiosMock.history.put].map((request) => request.url);
      expect(sent).not.toContain(studioUrl('/xblock/block-2'));
      expect(sent).not.toContain(studioUrl('/xblock/block-3'));
      expect(assign).not.toHaveBeenCalled();
    });

    it('goes to the login again once the cooldown has passed', async () => {
      window.sessionStorage.setItem(LAST_REDIRECT_KEY, String(Date.now() - REDIRECT_COOLDOWN_MS * 2));
      axiosMock.onGet(studioUrl('/xblock/block-1')).reply(401);

      track(get('/xblock/block-1'));

      await waitFor(() => expect(assign).toHaveBeenCalledTimes(1));
    });

    it('holds back Studio requests while going to the login', async () => {
      const lmsUrl = `${getConfig().LMS_BASE_URL}/api/user/v1/me`;
      axiosMock.onGet(studioUrl('/xblock/block-1')).reply(401);
      axiosMock.onGet(studioUrl('/xblock/block-2')).reply(200, {});
      axiosMock.onGet(lmsUrl).reply(200, {});
      track(get('/xblock/block-1'));
      await waitFor(() => expect(assign).toHaveBeenCalledTimes(1));

      const held = track(get('/xblock/block-2'));
      await expect(getAuthenticatedHttpClient().get(lmsUrl)).resolves.toMatchObject({ status: 200 });
      await flushPromises();

      expect(held.settled).toBe(false);
      expect(axiosMock.history.get.map((request) => request.url)).not.toContain(studioUrl('/xblock/block-2'));
    });

    it('sends held requests and fails held ones when the page is still open after a while', async () => {
      jest.useFakeTimers();
      try {
        axiosMock.onGet(studioUrl('/xblock/block-1')).reply(401);
        axiosMock.onGet(studioUrl('/xblock/block-2')).reply(200, {});
        const failed = track(get('/xblock/block-1'));
        await jest.advanceTimersByTimeAsync(0);
        expect(assign).toHaveBeenCalledTimes(1);
        const held = get('/xblock/block-2');

        await jest.advanceTimersByTimeAsync(HOLD_REQUESTS_MS);

        await expect(held).resolves.toMatchObject({ status: 200 });
        expect(failed.error).toMatchObject({ response: { status: 401 } });
      } finally {
        jest.useRealTimers();
      }
    });
  });

  describe('shouldRetryQuery', () => {
    it('does not retry a query that Studio answered with 401', () => {
      const error = { response: { status: 401, config: { url: studioUrl('/xblock/block-1') } } };

      expect(shouldRetryQuery(0, error)).toBe(false);
    });

    it('does not retry a query that failed for lack of a Studio session', async () => {
      studio.lmsSignedIn = false;
      window.sessionStorage.setItem(LAST_REDIRECT_KEY, String(Date.now()));
      axiosMock.onGet(studioUrl('/xblock/block-1')).networkError();

      const error = await get('/xblock/block-1').catch((e) => e);

      expect(error.response).toBeUndefined();
      expect(shouldRetryQuery(0, error)).toBe(false);
    });

    it('retries other failed queries up to the React Query default', async () => {
      axiosMock.onGet(studioUrl('/xblock/block-1')).reply(500);
      const error = await get('/xblock/block-1').catch((e) => e);

      expect(shouldRetryQuery(0, error)).toBe(true);
      expect(shouldRetryQuery(2, error)).toBe(true);
      expect(shouldRetryQuery(3, error)).toBe(false);
    });
  });

  describe('isStudioUnauthorizedError', () => {
    it('is false for a 401 without a usable URL', () => {
      expect(isStudioUnauthorizedError({ response: { status: 401, config: {} } })).toBe(false);
      expect(isStudioUnauthorizedError({ response: { status: 401, config: { url: 'http://[' } } })).toBe(false);
    });
  });

  describe('redirectToStudioLogin', () => {
    it('starts one navigation for many calls', () => {
      expect(redirectToStudioLogin()).toBe(true);
      expect(redirectToStudioLogin()).toBe(false);

      expect(assign).toHaveBeenCalledTimes(1);
    });

    it('still goes to the login once when sessionStorage is not available', () => {
      const denied = () => {
        throw new Error('Access denied');
      };
      const getItem = jest.spyOn(Storage.prototype, 'getItem').mockImplementation(denied);
      const setItem = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(denied);
      try {
        expect(redirectToStudioLogin()).toBe(true);

        expect(assign).toHaveBeenCalledTimes(1);
      } finally {
        getItem.mockRestore();
        setItem.mockRestore();
      }
    });
  });
});
