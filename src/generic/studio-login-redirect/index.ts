import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

/** sessionStorage key holding the time of the last redirect to the Studio login. */
export const LAST_REDIRECT_KEY = 'studioLoginRedirectAt';

/** A login that did not restore the session must not be retried in a loop. */
export const REDIRECT_COOLDOWN_MS = 60_000;

let isRedirecting = false;

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
  const studioBaseUrl = getConfig().STUDIO_BASE_URL;
  const requestUrl = error.response.config?.url ?? error.config?.url;
  if (!studioBaseUrl || !requestUrl) {
    return false;
  }
  const baseUrl = error.response.config?.baseURL ?? error.config?.baseURL ?? window.location.href;
  try {
    return new URL(requestUrl, baseUrl).origin === new URL(studioBaseUrl).origin;
  } catch {
    return false;
  }
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
  const studioBaseUrl = getConfig().STUDIO_BASE_URL;
  if (!studioBaseUrl || isRedirecting || redirectedRecently()) {
    return false;
  }
  isRedirecting = true;
  try {
    window.sessionStorage.setItem(LAST_REDIRECT_KEY, String(Date.now()));
  } catch {
    // Without sessionStorage there is no loop guard across page loads; still redirect once.
  }
  const loginUrl = new URL('/login/', studioBaseUrl);
  loginUrl.searchParams.set('next', window.location.href);
  window.location.assign(loginUrl.href);
  return true;
};

/**
 * Redirect to the Studio login when Studio answers a request with a 401.
 *
 * The error is still rejected, so callers see the same failure they would have
 * seen without the redirect.
 */
export const addStudioLoginRedirectInterceptor = (httpClient = getAuthenticatedHttpClient()) => (
  httpClient.interceptors.response.use(undefined, (error: any) => {
    if (isStudioUnauthorizedError(error)) {
      redirectToStudioLogin();
    }
    return Promise.reject(error);
  })
);

/** The default number of retries React Query makes for a failed query. */
const DEFAULT_QUERY_RETRIES = 3;

/**
 * React Query `retry` option: the default, except that a 401 from Studio is not retried.
 *
 * The Studio session is gone and the page is on its way to the login, so a retry can only fail again.
 */
export const shouldRetryQuery = (failureCount: number, error: unknown): boolean => (
  !isStudioUnauthorizedError(error) && failureCount < DEFAULT_QUERY_RETRIES
);

/** Only for tests: forget that a redirect was started. */
export const resetStudioLoginRedirect = () => {
  isRedirecting = false;
};
