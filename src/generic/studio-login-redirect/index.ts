import { getConfig } from '@edx/frontend-platform';
import { getAuthService, getAuthenticatedHttpClient, getHttpClient } from '@edx/frontend-platform/auth';

/** How long the session check and the background sign-in may take before they count as failed. */
export const STUDIO_CHECK_TIMEOUT_MS = 10_000;

/**
 * How long the background sign-in waits for Studio requests that were already sent. Each one that reaches
 * Studio's login starts a login of its own, which replaces the OAuth state that the sign-in needs.
 */
export const WAIT_FOR_SENT_REQUESTS_MS = 5_000;

/**
 * How long after Cancel a Studio read that fails for lack of a session fails without opening the dialog
 * again. Pages that poll Studio (e.g. the export page, every 3s) would otherwise open it right away. A save
 * still opens it, as the user asked for it.
 */
export const SIGN_IN_PROMPT_PAUSE_MS = 30_000;

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

/**
 * What the sign-in dialog shows. It opens when the background sign-in finds that the user is signed out
 * of the LMS too, and Studio requests are held for as long as it is open.
 *
 * - `signedOut`: the user has to sign in again.
 * - `signingIn`: the user opened the login in another tab.
 * - `checking`: checking whether the user signed in.
 * - `stillSignedOut`: the user came back without signing in.
 */
export type SignInPromptStatus = 'closed' | 'signedOut' | 'signingIn' | 'checking' | 'stillSignedOut';

let isSigningIn = false;
let signInCount = 0;
let inFlight = 0;
let onSentRequestsDone: (() => void) | undefined;
let promptStatus: SignInPromptStatus = 'closed';
let promptPausedUntil = 0;
const promptListeners = new Set<() => void>();
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
 * The Studio login, which goes to Studio home afterwards. Coming back to this page would leave the user with
 * two copies of it, and the save held here could later overwrite an edit made in the other one.
 */
export const getStudioLoginUrl = () => new URL('/login/', getConfig().STUDIO_BASE_URL).href;

/**
 * Sign in to Studio without leaving the page. This works while the user is signed in to the LMS.
 * Resolves to undefined if Studio did not answer in time.
 *
 * Studio's login is a chain of redirects through the LMS. The page's own requests cannot follow it, as
 * CORS stops them at the LMS, but a `no-cors` request can, and the session cookie it ends with is kept.
 */
const signInSilently = async (): Promise<boolean | undefined> => {
  const loginUrl = new URL(getStudioLoginUrl());
  loginUrl.searchParams.set('next', SESSION_CHECK_PATH);
  try {
    await getFromStudio(loginUrl.href, { mode: 'no-cors' });
  } catch {
    return undefined;
  }
  return hasStudioSession();
};

const setPromptStatus = (status: SignInPromptStatus) => {
  promptStatus = status;
  promptListeners.forEach((listener) => listener());
};

const isPrompting = () => promptStatus !== 'closed';

/** Subscribe to changes of the sign-in dialog (for `useSyncExternalStore`). */
export const subscribeToSignInPrompt = (listener: () => void) => {
  promptListeners.add(listener);
  return () => {
    promptListeners.delete(listener);
  };
};

export const getSignInPromptStatus = () => promptStatus;

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
 * Sign in in the background once the requests already sent are answered, so that none of them reaches
 * Studio's login during the sign-in and replaces its OAuth state.
 */
const signInAfterSentRequests = async () => {
  await sentRequestsDone();
  return signInSilently();
};

/**
 * Signing in gives Studio a new CSRF token: forget the old one, or every save from then on is refused with
 * a 403, which nothing here recovers from.
 */
const forgetCsrfToken = () => getAuthService()?.getCsrfTokenService?.()?.clearCsrfTokenCache();

/** There is a Studio session again: send the held requests. */
const onSignedIn = () => {
  signInCount += 1;
  forgetCsrfToken();
  releaseHeld((request) => request.send());
};

/**
 * Get a Studio session back for the held requests.
 *
 * While the user is signed in to the LMS, this signs in to Studio without leaving the page and sends
 * the requests again, so the page never sees them fail. It first waits for the requests already sent,
 * so that none of them reaches Studio's login during the sign-in. Otherwise the user has to sign in
 * again, and the sign-in dialog asks them to, keeping the requests held so that a save in progress is
 * not lost. If Studio does not answer in time, the requests fail as before.
 */
const restoreStudioSession = async () => {
  isSigningIn = true;
  const signedIn = await signInAfterSentRequests();
  isSigningIn = false;
  if (signedIn) {
    onSignedIn();
  } else if (signedIn === undefined) {
    stopHolding();
  } else {
    openSignInPrompt();
  }
};

/**
 * Check whether the user signed in from the other tab, and if so close the dialog and send the held
 * requests.
 *
 * Signing in there gives this browser a Studio session too. If the user only got as far as the LMS
 * (e.g. they closed the tab before it came back to Studio), the background sign-in finishes the job.
 * The dialog cannot be cancelled during the check, so the check cannot outlive it.
 */
export const continueAfterSignIn = async () => {
  if (promptStatus === 'closed' || promptStatus === 'checking') {
    return;
  }
  setPromptStatus('checking');
  const signedIn = (await hasStudioSession()) || (await signInAfterSentRequests());
  if (signedIn) {
    stopWatchingForReturn();
    setPromptStatus('closed');
    onSignedIn();
  } else {
    setPromptStatus('stillSignedOut');
  }
};

/**
 * The user may have signed in from another tab or window. Opening one hides this tab or takes the focus
 * from this window, so either event coming back means the user is back here.
 */
const onReturn = () => {
  if (document.visibilityState === 'visible') {
    void continueAfterSignIn();
  }
};

const stopWatchingForReturn = () => {
  window.removeEventListener('focus', onReturn);
  document.removeEventListener('visibilitychange', onReturn);
};

/**
 * Ask the user to sign in again. The page watches for the user coming back from the moment the dialog
 * opens, so a login opened without the Sign in button's click (e.g. with a middle click) counts too.
 */
const openSignInPrompt = () => {
  setPromptStatus('signedOut');
  window.addEventListener('focus', onReturn);
  document.addEventListener('visibilitychange', onReturn);
};

/** The user opened the Studio login in another tab. */
export const startSignIn = () => {
  if (promptStatus !== 'checking') {
    setPromptStatus('signingIn');
  }
};

/**
 * The user chose to stay on the page without signing in: the held requests fail without being sent.
 * The user may have signed in from the other tab anyway, so the CSRF token is forgotten too. For
 * SIGN_IN_PROMPT_PAUSE_MS, only a save opens the dialog again.
 */
export const cancelSignIn = () => {
  if (promptStatus === 'checking') {
    return;
  }
  stopWatchingForReturn();
  setPromptStatus('closed');
  promptPausedUntil = Date.now() + SIGN_IN_PROMPT_PAUSE_MS;
  forgetCsrfToken();
  releaseHeld((request) => request.fail());
};

/**
 * Handle requests that Studio refuses because there is no Studio session.
 *
 * Studio refuses them with a 401 when it has the companion openedx-platform change. Until then its older
 * views redirect them to its login, and the browser blocks that redirect for a cross-origin request, so
 * the request fails with no response. hasStudioSession() tells both apart from other failures.
 *
 * Such requests, and the Studio requests made while the session is being restored or the sign-in dialog
 * is open, are held back until there is a session again or the user cancels the dialog: the page does not
 * see failures that are about to be fixed.
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
    if (isSigningIn || isPrompting()) {
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
    if (!isSigningIn && !isPrompting() && (await hasStudioSession()) !== false) {
      return Promise.reject(error);
    }
    // eslint-disable-next-line no-param-reassign
    error[STUDIO_SESSION_ERROR] = true;
    if (!isSigningIn && !isPrompting() && !isSave(config) && Date.now() < promptPausedUntil) {
      return Promise.reject(error);
    }
    const result = new Promise((resolve, reject) => {
      held.push({
        queued: false,
        send: () => {
          httpClient.request({ ...config, [RESENT]: true }).then(resolve, reject);
        },
        fail: () => reject(error),
      });
    });
    if (!isSigningIn && !isPrompting()) {
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

/** Only for tests: forget any sign-in, dialog or held request. */
export const resetStudioLoginRedirect = () => {
  stopWatchingForReturn();
  promptStatus = 'closed';
  promptPausedUntil = 0;
  isSigningIn = false;
  signInCount = 0;
  inFlight = 0;
  onSentRequestsDone = undefined;
  sessionCheck = null;
  held = [];
};
