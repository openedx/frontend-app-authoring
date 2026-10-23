import { getConfig } from '@edx/frontend-platform';
import { getAuthService, getAuthenticatedHttpClient, getHttpClient } from '@edx/frontend-platform/auth';
import type MockAdapter from 'axios-mock-adapter';

import { initializeMocks, waitFor } from '@src/testUtils';
import {
  STUDIO_CHECK_TIMEOUT_MS,
  WAIT_FOR_SENT_REQUESTS_MS,
  addStudioLoginRedirectInterceptor,
  cancelSignIn,
  continueAfterSignIn,
  getSignInPromptStatus,
  getStudioLoginUrl,
  isStudioUnauthorizedError,
  resetStudioLoginRedirect,
  shouldRetryQuery,
  startSignIn,
  subscribeToSignInPrompt,
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
  checkDone: Promise.resolve(),
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
    await studio.checkDone;
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
const sessionChecks = () => (global.fetch as jest.Mock).mock.calls.filter(([, init]) => init?.mode !== 'no-cors');

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

    /** The user signs in from the login tab the dialog opened, which gives this browser a Studio session. */
    const signInInOtherTab = () => {
      studio.lmsSignedIn = true;
      studio.hasSession = true;
    };

    it('asks the user to sign in, without leaving the page or failing the request', async () => {
      axiosMock.onGet(studioUrl('/xblock/block-1')).networkError();

      const request = track(get('/xblock/block-1'));
      await waitFor(() => expect(getSignInPromptStatus()).toEqual('signedOut'));
      await flushPromises();

      expect(request.settled).toBe(false);
      expect(assign).not.toHaveBeenCalled();
    });

    it('asks once when many requests fail together', async () => {
      const paths = [1, 2, 3, 4, 5].map((id) => `/xblock/block-${id}`);
      paths.forEach((path) => axiosMock.onGet(studioUrl(path)).reply(401));

      paths.forEach((path) => track(get(path)));
      await waitFor(() => expect(getSignInPromptStatus()).toEqual('signedOut'));
      await flushPromises();

      expect(signInRequests()).toHaveLength(1);
    });

    it('sends a save again once the user is back from signing in in another tab', async () => {
      const clearCsrfTokenCache = jest.fn();
      getAuthService().getCsrfTokenService = () => ({ clearCsrfTokenCache });
      failOnceWithoutSession('onPost', '/xblock/', 401);
      const request = post('/xblock/');
      await waitFor(() => expect(getSignInPromptStatus()).toEqual('signedOut'));

      startSignIn();
      expect(getSignInPromptStatus()).toEqual('signingIn');
      signInInOtherTab();
      window.dispatchEvent(new Event('focus'));

      await expect(request).resolves.toMatchObject({ status: 200, data: { path: '/xblock/' } });
      expect(getSignInPromptStatus()).toEqual('closed');
      expect(clearCsrfTokenCache).toHaveBeenCalledTimes(1);
      expect(assign).not.toHaveBeenCalled();
    });

    it('finishes the sign-in in the background when the user only signed in to the LMS', async () => {
      failOnceWithoutSession('onGet', '/xblock/block-1', 401);
      const request = get('/xblock/block-1');
      await waitFor(() => expect(getSignInPromptStatus()).toEqual('signedOut'));

      startSignIn();
      studio.lmsSignedIn = true;
      document.dispatchEvent(new Event('visibilitychange'));

      await expect(request).resolves.toMatchObject({ status: 200 });
      expect(signInRequests()).toHaveLength(2);
    });

    it('says so when the user comes back without signing in, and continues when asked', async () => {
      failOnceWithoutSession('onGet', '/xblock/block-1', 401);
      const request = get('/xblock/block-1');
      await waitFor(() => expect(getSignInPromptStatus()).toEqual('signedOut'));
      startSignIn();

      window.dispatchEvent(new Event('focus'));
      await waitFor(() => expect(getSignInPromptStatus()).toEqual('stillSignedOut'));
      signInInOtherTab();
      await continueAfterSignIn();

      await expect(request).resolves.toMatchObject({ status: 200 });
      expect(getSignInPromptStatus()).toEqual('closed');
    });

    it('holds back Studio requests while asking, and fails them unsent when the user cancels', async () => {
      const lmsUrl = `${getConfig().LMS_BASE_URL}/api/user/v1/me`;
      axiosMock.onPost(studioUrl('/xblock/')).reply(401);
      axiosMock.onGet(studioUrl('/xblock/block-2')).reply(200, {});
      axiosMock.onPut(studioUrl('/xblock/block-3')).reply(200, {});
      axiosMock.onGet(lmsUrl).reply(200, {});
      const failed = track(post('/xblock/'));
      await waitFor(() => expect(getSignInPromptStatus()).toEqual('signedOut'));
      const queuedRead = track(get('/xblock/block-2'));
      const queuedSave = track(getAuthenticatedHttpClient().put(studioUrl('/xblock/block-3')));
      await expect(getAuthenticatedHttpClient().get(lmsUrl)).resolves.toMatchObject({ status: 200 });
      await flushPromises();
      expect(queuedRead.settled || queuedSave.settled || failed.settled).toBe(false);

      cancelSignIn();
      await waitFor(() => expect(failed.settled && queuedRead.settled && queuedSave.settled).toBe(true));

      expect(getSignInPromptStatus()).toEqual('closed');
      expect(failed.error).toMatchObject({ response: { status: 401 } });
      expect(shouldRetryQuery(0, failed.error)).toBe(false);
      expect(shouldRetryQuery(0, queuedRead.error)).toBe(false);
      expect(queuedSave.error).toBeDefined();
      const sent = [...axiosMock.history.get, ...axiosMock.history.put].map((request) => request.url);
      expect(sent).not.toContain(studioUrl('/xblock/block-2'));
      expect(sent).not.toContain(studioUrl('/xblock/block-3'));
    });

    it('stops watching for the user to come back once they cancel', async () => {
      axiosMock.onGet(studioUrl('/xblock/block-1')).reply(401);
      track(get('/xblock/block-1'));
      await waitFor(() => expect(getSignInPromptStatus()).toEqual('signedOut'));
      startSignIn();
      cancelSignIn();
      const fetchCalls = (global.fetch as jest.Mock).mock.calls.length;

      window.dispatchEvent(new Event('focus'));
      await flushPromises();

      expect(getSignInPromptStatus()).toEqual('closed');
      expect((global.fetch as jest.Mock).mock.calls).toHaveLength(fetchCalls);
    });

    it('tells subscribers when the dialog changes, until they unsubscribe', async () => {
      const listener = jest.fn();
      const unsubscribe = subscribeToSignInPrompt(listener);
      axiosMock.onGet(studioUrl('/xblock/block-1')).reply(401);
      track(get('/xblock/block-1'));
      await waitFor(() => expect(listener).toHaveBeenCalledTimes(1));

      unsubscribe();
      cancelSignIn();

      expect(listener).toHaveBeenCalledTimes(1);
    });

    it('cannot be cancelled during the check', async () => {
      failOnceWithoutSession('onPost', '/xblock/', 401);
      const request = post('/xblock/');
      await waitFor(() => expect(getSignInPromptStatus()).toEqual('signedOut'));
      startSignIn();
      signInInOtherTab();

      const check = continueAfterSignIn();
      expect(getSignInPromptStatus()).toEqual('checking');
      cancelSignIn();
      expect(getSignInPromptStatus()).toEqual('checking');
      await check;

      await expect(request).resolves.toMatchObject({ status: 200 });
      expect(getSignInPromptStatus()).toEqual('closed');
    });

    it('forgets the CSRF token when the user cancels, as they may have signed in anyway', async () => {
      const clearCsrfTokenCache = jest.fn();
      getAuthService().getCsrfTokenService = () => ({ clearCsrfTokenCache });
      axiosMock.onPost(studioUrl('/xblock/')).reply(401);
      track(post('/xblock/'));
      await waitFor(() => expect(getSignInPromptStatus()).toEqual('signedOut'));
      startSignIn();

      cancelSignIn();

      expect(clearCsrfTokenCache).toHaveBeenCalledTimes(1);
    });

    it('checks when the user comes back, even if the login was not opened with the Sign in click', async () => {
      failOnceWithoutSession('onGet', '/xblock/block-1', 401);
      const request = get('/xblock/block-1');
      await waitFor(() => expect(getSignInPromptStatus()).toEqual('signedOut'));

      signInInOtherTab();
      window.dispatchEvent(new Event('focus'));

      await expect(request).resolves.toMatchObject({ status: 200 });
    });

    it('checks once when the page is both shown and focused again', async () => {
      failOnceWithoutSession('onGet', '/xblock/block-1', 401);
      const request = get('/xblock/block-1');
      await waitFor(() => expect(getSignInPromptStatus()).toEqual('signedOut'));
      startSignIn();
      const checksBefore = sessionChecks().length;

      signInInOtherTab();
      document.dispatchEvent(new Event('visibilitychange'));
      window.dispatchEvent(new Event('focus'));

      await expect(request).resolves.toMatchObject({ status: 200 });
      expect(sessionChecks()).toHaveLength(checksBefore + 1);
    });

    it('holds a request that Studio refuses while the dialog is open, and sends it again after sign-in', async () => {
      let refuseNow: () => void = () => {};
      axiosMock.onGet(studioUrl('/api/contentstore/v1/thing')).replyOnce(() =>
        new Promise((resolve) => {
          refuseNow = () => resolve([401]);
        })
      );
      axiosMock.onGet(studioUrl('/api/contentstore/v1/thing')).reply(200, { resent: true });
      axiosMock.onGet(studioUrl('/xblock/block-1')).reply(401);
      const slow = get('/api/contentstore/v1/thing');
      track(get('/xblock/block-1'));
      await waitFor(() => expect(getSignInPromptStatus()).toEqual('signedOut'));
      const checksBefore = sessionChecks().length;

      refuseNow();
      await flushPromises();
      expect(sessionChecks()).toHaveLength(checksBefore);
      startSignIn();
      signInInOtherTab();
      await continueAfterSignIn();

      await expect(slow).resolves.toMatchObject({ data: { resent: true } });
    });

    it('holds a request made during the check and sends it once the user is signed in', async () => {
      axiosMock.onPost(studioUrl('/xblock/')).reply(401);
      axiosMock.onGet(studioUrl('/xblock/block-3')).reply(200, {});
      track(post('/xblock/'));
      await waitFor(() => expect(getSignInPromptStatus()).toEqual('signedOut'));
      startSignIn();
      signInInOtherTab();
      let finishCheck: () => void = () => {};
      studio.checkDone = new Promise((resolve) => {
        finishCheck = resolve;
      });

      const check = continueAfterSignIn();
      const duringCheck = get('/xblock/block-3');
      await flushPromises();
      expect(axiosMock.history.get.map((request) => request.url)).not.toContain(studioUrl('/xblock/block-3'));
      finishCheck();
      await check;

      await expect(duringCheck).resolves.toMatchObject({ status: 200 });
    });
  });

  describe('shouldRetryQuery', () => {
    it('does not retry a query that Studio answered with 401', () => {
      const error = { response: { status: 401, config: { url: studioUrl('/xblock/block-1') } } };

      expect(shouldRetryQuery(0, error)).toBe(false);
    });

    it('does not retry a query that failed for lack of a Studio session', async () => {
      studio.lmsSignedIn = false;
      axiosMock.onGet(studioUrl('/xblock/block-1')).networkError();

      const request = get('/xblock/block-1').catch((e) => e);
      await waitFor(() => expect(getSignInPromptStatus()).toEqual('signedOut'));
      cancelSignIn();
      const error = await request;

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

  describe('getStudioLoginUrl', () => {
    it('goes to Studio home after the login, not to a second copy of this page', () => {
      const loginUrl = new URL(getStudioLoginUrl());

      expect(loginUrl.origin).toEqual(new URL(getConfig().STUDIO_BASE_URL).origin);
      expect(loginUrl.pathname).toEqual('/login/');
      expect(loginUrl.searchParams.has('next')).toBe(false);
    });
  });
});
