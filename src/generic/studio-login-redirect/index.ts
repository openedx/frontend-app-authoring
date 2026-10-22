import { getConfig } from '@edx/frontend-platform';
import { getAuthService, getAuthenticatedHttpClient, getHttpClient } from '@edx/frontend-platform/auth';

/** sessionStorage key holding the time of the last redirect to the Studio login. */
export const LAST_REDIRECT_KEY = 'studioLoginRedirectAt';

/** A login that did not restore the session must not be retried in a loop. */
export const REDIRECT_COOLDOWN_MS = 60_000;

/**
 * How long Studio requests and their errors are held back after starting the login. If the page is
 * still here after that, the navigation was cancelled (e.g. by an unsaved changes prompt): the held
 * requests are sent and the held errors reach the page.
 */
export const HOLD_REQUESTS_MS = 15_000;

/** How long the session check and the background sign-in may take before they count as failed. */
export const STUDIO_CHECK_TIMEOUT_MS = 10_000;

/**
 * How long the background sign-in waits for Studio requests that were already sent. Each one that reaches
 * Studio's login starts a login of its own, which replaces the OAuth state that the sign-in needs.
 */
export const WAIT_FOR_SENT_REQUESTS_MS = 5_000;

/**
 * A Studio URL that needs the Studio session and is cheap to call. With a session, a GET to it
 * answers 400 ("Only instance creation is supported without a usage key") without reading anything.
 */
const SESSION_CHECK_PATH = '/xblock/';

/** Marks an error caused by the missing Studio session. A property, as error handlers wrap errors. */
const STUDIO_SESSION_ERROR = Symbol('studioSessionError');

// Request config flags. Strings, as axios keeps unknown string keys when it copies a config.
/** Sent again after signing in, so it is never sent a third time. */
const RESENT = 'studioLoginRedirectResent';
/** The number of background sign-ins done when the request was sent. */
const SENT_AFTER = 'studioLoginRedirectSentAfter';
/** Sent to a view that redirects to the login without a session, and not answered yet. */
const IN_FLIGHT = 'studioLoginRedirectInFlight';

/** A request held back because there is no Studio session. */
interface HeldRequest {
  /** Held before it was sent, rather than after it failed. */
  queued: boolean;
  /** There is a Studio session now: send the request (again). */
  send: () => void;
  /** There is no Studio session: fail the request without sending it. */
  fail: () => void;
}

let isSigningIn = false;
let isRedirecting = false;
let signInCount = 0;
let inFlight = 0;
let onSentRequestsDone: (() => void) | undefined;
let holdRequestsTimer: ReturnType<typeof setTimeout> | undefined;
let sessionCheck: Promise<boolean | undefined> | null = null;
let held: HeldRequest[] = [];

const releaseHeld = (release: (request: HeldRequest) => void) => {
  const toRelease = held;
  held = [];
  toRelease.forEach(release);
};

/** Stop waiting for the session: what failed fails, and what waited to be sent is sent. */
const stopHolding = () => releaseHeld((request) => (request.queued ? request.send() : request.fail()));

const isSave = (config: { method?: string; }) => (config.method ?? 'get').toLowerCase() !== 'get';

const isStudioUrl = (url?: string, baseUrl?: string): boolean => {
  const studioBaseUrl = getConfig().STUDIO_BASE_URL;
  if (!studioBaseUrl || !url) {
    return false;
  }
  try {
    return new URL(url, baseUrl ?? window.location.href).origin === new URL(studioBaseUrl).origin;
  } catch {
    return false;
  }
};

/**
 * Whether the error is a 401 answered by Studio itself.
 *
 * A 401 from the LMS (e.g. the token refresh of a signed-out user) is handled by
 * frontend-platform and must not send the user to the Studio login.
 */
export const isStudioUnauthorizedError = (error: any): boolean => {
  if (error?.response?.status !== 401) {
    return false;
  }
  const config = error.response.config ?? error.config;
  return isStudioUrl(config?.url, config?.baseURL);
};

/** Whether the request failed because there is no Studio session, either as a 401 or as found below. */
export const isStudioSessionError = (error: any): boolean => (
  isStudioUnauthorizedError(error) || error?.[STUDIO_SESSION_ERROR] === true
);

/** The request got no response at all. Cancelled and timed out requests do not count. */
const failedWithoutResponse = (error: any): boolean => (
  !!error?.config && !error.response && !['ERR_CANCELED', 'ECONNABORTED', 'ETIMEDOUT'].includes(error.code)
);

/**
 * Whether the URL is one of Studio's older views. Without a session, these redirect to the login before
 * doing anything, so a request to them that got no response is safe to send again. Studio's REST APIs
 * (under /api/) answer 401 instead: one of their requests that got no response may have been carried out.
 */
const redirectsWithoutSession = (url?: string, baseUrl?: string): boolean => {
  try {
    return !new URL(url ?? '', baseUrl ?? window.location.href).pathname.startsWith('/api/');
  } catch {
    return false;
  }
};

/**
 * GET a Studio URL with `fetchOptions` that an XHR does not have, through the HTTP client's `fetch`
 * adapter. Any answer counts. Gives up after STUDIO_CHECK_TIMEOUT_MS, so a stalled Studio cannot hold
 * requests back.
 *
 * It uses the plain client: the authenticated one would hold these requests back while signing in, and
 * would add the JWT header to a check that is about the Studio session.
 */
const getFromStudio = (url: string, fetchOptions: RequestInit) =>
  getHttpClient().get(url, {
    adapter: 'fetch',
    fetchOptions: { cache: 'no-store', ...fetchOptions },
    withCredentials: true,
    timeout: STUDIO_CHECK_TIMEOUT_MS,
    validateStatus: () => true,
  });

const checkStudioSession = async (): Promise<boolean | undefined> => {
  try {
    const { status } = await getFromStudio(new URL(SESSION_CHECK_PATH, getConfig().STUDIO_BASE_URL).href, {
      redirect: 'manual',
    });
    // Without a session Studio redirects to its login (status 0, as the redirect is not followed), or
    // answers 401 once it has the platform change.
    return status !== 0 && status !== 401;
  } catch {
    return undefined;
  }
};

/**
 * Whether this browser has a Studio session, or undefined if Studio did not answer in time.
 *
 * Without one, Studio redirects a request to its login. The `fetch` adapter with `redirect: 'manual'`
 * can see that redirect, which an XHR cannot. Requests made at the same time share one check.
 */
export const hasStudioSession = (): Promise<boolean | undefined> => {
  if (!sessionCheck) {
    sessionCheck = checkStudioSession().finally(() => {
      sessionCheck = null;
    });
  }
  return sessionCheck;
};

/**
 * Sign in to Studio without leaving the page. This works while the user is signed in to the LMS.
 * Resolves to undefined if Studio did not answer in time.
 *
 * Studio's login is a chain of redirects through the LMS. The page's own requests cannot follow it, as
 * CORS stops them at the LMS, but a `no-cors` request can, and the session cookie it ends with is kept.
 */
const signInSilently = async (): Promise<boolean | undefined> => {
  const loginUrl = new URL('/login/', getConfig().STUDIO_BASE_URL);
  loginUrl.searchParams.set('next', SESSION_CHECK_PATH);
  try {
    await getFromStudio(loginUrl.href, { mode: 'no-cors' });
  } catch {
    return undefined;
  }
  return hasStudioSession();
};

const redirectedRecently = (): boolean => {
  try {
    const lastRedirect = Number(window.sessionStorage.getItem(LAST_REDIRECT_KEY));
    return lastRedirect > 0 && Date.now() - lastRedirect < REDIRECT_COOLDOWN_MS;
  } catch {
    return false;
  }
};

/**
 * Send the browser to the Studio login, returning to the current page afterwards.
 *
 * Many of the endpoints this app calls are authenticated by the Studio session
 * and not by the JWT cookies, so the Studio session can lapse while the user is
 * still signed in to the LMS. One page then fails many requests at once, and
 * all of them must share a single navigation.
 *
 * @returns whether a navigation was started.
 */
export const redirectToStudioLogin = (): boolean => {
  if (!getConfig().STUDIO_BASE_URL || isRedirecting || redirectedRecently()) {
    return false;
  }
  isRedirecting = true;
  clearTimeout(holdRequestsTimer);
  holdRequestsTimer = setTimeout(() => {
    isRedirecting = false;
    stopHolding();
  }, HOLD_REQUESTS_MS);
  try {
    window.sessionStorage.setItem(LAST_REDIRECT_KEY, String(Date.now()));
  } catch {
    // Without sessionStorage there is no loop guard across page loads; still redirect once.
  }
  const loginUrl = new URL('/login/', getConfig().STUDIO_BASE_URL);
  loginUrl.searchParams.set('next', window.location.href);
  window.location.assign(loginUrl.href);
  return true;
};

/**
 * Resolves once no request that could reach Studio's login is in flight any more, or after
 * WAIT_FOR_SENT_REQUESTS_MS.
 */
const sentRequestsDone = () =>
  new Promise<void>((resolve) => {
    if (inFlight === 0) {
      resolve();
      return;
    }
    const timer = setTimeout(() => onSentRequestsDone?.(), WAIT_FOR_SENT_REQUESTS_MS);
    onSentRequestsDone = () => {
      clearTimeout(timer);
      onSentRequestsDone = undefined;
      resolve();
    };
  });

/**
 * Get a Studio session back for the held requests.
 *
 * While the user is signed in to the LMS, this signs in to Studio without leaving the page and sends
 * the requests again, so the page never sees them fail. It first waits for the requests already sent,
 * so that none of them reaches Studio's login during the sign-in. Otherwise the user has to sign in
 * again: the page goes to the login and comes back. If the last login did not restore the session, or
 * Studio does not answer in time, the requests fail as before.
 */
const restoreStudioSession = async () => {
  isSigningIn = true;
  await sentRequestsDone();
  const signedIn = await signInSilently();
  isSigningIn = false;
  if (signedIn) {
    signInCount += 1;
    // Signing in gave Studio a new CSRF token: forget the old one, or every save from now on is refused.
    getAuthService()?.getCsrfTokenService?.()?.clearCsrfTokenCache();
    releaseHeld((request) => request.send());
  } else if (signedIn === undefined) {
    stopHolding();
  } else if (!redirectToStudioLogin()) {
    // Going to the login again right after one that did not restore the session would loop.
    releaseHeld((request) => request.fail());
  }
};

/**
 * Handle requests that Studio refuses because there is no Studio session.
 *
 * Studio refuses them with a 401 when it has the companion openedx-platform change. Until then its older
 * views redirect them to its login, and the browser blocks that redirect for a cross-origin request, so
 * the request fails with no response. hasStudioSession() tells both apart from other failures.
 *
 * Such requests, and the Studio requests made while the session is being restored, are held back
 * until restoreStudioSession() is done: the page does not see failures that are about to be fixed.
 * Studio requests made meanwhile would also start logins of their own and break the one in progress.
 * A request counts as in flight until it is answered, not until the page gets its result, so the
 * held requests do not keep the sign-in waiting.
 *
 * @returns a function that removes the interceptors.
 */
export const addStudioLoginRedirectInterceptor = (httpClient = getAuthenticatedHttpClient()) => {
  const markSent = (config: any) => {
    /* eslint-disable no-param-reassign */
    config[SENT_AFTER] = signInCount;
    if (redirectsWithoutSession(config.url, config.baseURL)) {
      config[IN_FLIGHT] = true;
      inFlight += 1;
    }
    /* eslint-enable no-param-reassign */
    return config;
  };
  const markAnswered = (config: any) => {
    if (config?.[IN_FLIGHT]) {
      // eslint-disable-next-line no-param-reassign
      config[IN_FLIGHT] = false;
      inFlight -= 1;
      if (inFlight === 0) {
        onSentRequestsDone?.();
      }
    }
  };

  const requestInterceptor = httpClient.interceptors.request.use((config) => {
    if (!isStudioUrl(config.url, config.baseURL)) {
      return config;
    }
    if (isSigningIn || isRedirecting) {
      return new Promise<typeof config>((resolve, reject) => {
        held.push({
          queued: true,
          send: () => resolve(markSent(config)),
          fail: () =>
            reject(Object.assign(
              new Error(`Not sent, as there is no Studio session: ${config.url}`),
              { [STUDIO_SESSION_ERROR]: true },
            )),
        });
      });
    }
    return markSent(config);
  });

  const responseInterceptor = httpClient.interceptors.response.use((response) => {
    markAnswered(response.config);
    return response;
  }, async (error: any) => {
    const config = error?.config;
    markAnswered(config);
    const mayLackSession = isStudioUnauthorizedError(error)
      || (failedWithoutResponse(error) && redirectsWithoutSession(config.url, config.baseURL));
    if (!mayLackSession || !isStudioUrl(config?.url, config?.baseURL) || config[RESENT]) {
      return Promise.reject(error);
    }
    if (config[SENT_AFTER] < signInCount) {
      // Sent before the last background sign-in, so it may have failed for lack of the session that
      // sign-in restored. Send a read again. Send a save again only if Studio refused it (401): a
      // failure with no response may come after Studio saved it.
      return (!isSave(config) || isStudioUnauthorizedError(error))
        ? httpClient.request({ ...config, [RESENT]: true })
        : Promise.reject(error);
    }
    if (!isSigningIn && (await hasStudioSession()) !== false) {
      return Promise.reject(error);
    }
    // eslint-disable-next-line no-param-reassign
    error[STUDIO_SESSION_ERROR] = true;
    const result = new Promise((resolve, reject) => {
      held.push({
        queued: false,
        send: () => {
          httpClient.request({ ...config, [RESENT]: true }).then(resolve, reject);
        },
        fail: () => reject(error),
      });
    });
    if (!isSigningIn && !isRedirecting) {
      void restoreStudioSession();
    }
    return result;
  });

  return () => {
    httpClient.interceptors.request.eject(requestInterceptor);
    httpClient.interceptors.response.eject(responseInterceptor);
  };
};

/** The default number of retries React Query makes for a failed query. */
const DEFAULT_QUERY_RETRIES = 3;

/**
 * React Query `retry` option: the default, except that a query failed for lack of a Studio session
 * is not retried.
 *
 * Such a query fails only when the session could not be restored, so a retry can only fail again.
 */
export const shouldRetryQuery = (failureCount: number, error: unknown): boolean => (
  !isStudioSessionError(error) && failureCount < DEFAULT_QUERY_RETRIES
);

/** Only for tests: forget any sign-in, redirect or held request. */
export const resetStudioLoginRedirect = () => {
  clearTimeout(holdRequestsTimer);
  isSigningIn = false;
  isRedirecting = false;
  signInCount = 0;
  inFlight = 0;
  onSentRequestsDone = undefined;
  sessionCheck = null;
  held = [];
};
