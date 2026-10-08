import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import type MockAdapter from 'axios-mock-adapter';

import { initializeMocks } from '@src/testUtils';
import {
  LAST_REDIRECT_KEY,
  REDIRECT_COOLDOWN_MS,
  addStudioLoginRedirectInterceptor,
  resetStudioLoginRedirect,
  shouldRetryQuery,
} from '.';

const originalLocation = window.location;
const pageUrl = 'http://localhost/course/course-v1:org+101+run';

describe('studio login redirect', () => {
  let axiosMock: MockAdapter;
  let assign: jest.Mock;
  let interceptorId: number;
  const studioUrl = (path: string) => `${getConfig().STUDIO_BASE_URL}${path}`;

  beforeEach(() => {
    ({ axiosMock } = initializeMocks());
    assign = jest.fn();
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { href: pageUrl, assign },
    });
    window.sessionStorage.clear();
    resetStudioLoginRedirect();
    interceptorId = addStudioLoginRedirectInterceptor();
  });

  afterEach(() => {
    getAuthenticatedHttpClient().interceptors.response.eject(interceptorId);
    Object.defineProperty(window, 'location', { configurable: true, value: originalLocation });
  });

  it('redirects to the Studio login when Studio answers 401', async () => {
    axiosMock.onGet(studioUrl('/xblock/outline/block-1')).reply(401);

    await expect(getAuthenticatedHttpClient().get(studioUrl('/xblock/outline/block-1')))
      .rejects.toMatchObject({ response: { status: 401 } });

    expect(assign).toHaveBeenCalledTimes(1);
    const loginUrl = new URL(assign.mock.calls[0][0]);
    expect(loginUrl.origin).toEqual(new URL(getConfig().STUDIO_BASE_URL).origin);
    expect(loginUrl.pathname).toEqual('/login/');
    expect(loginUrl.searchParams.get('next')).toEqual(pageUrl);
  });

  it('redirects once when many requests fail together', async () => {
    const urls = [1, 2, 3, 4, 5].map((id) => studioUrl(`/xblock/outline/block-${id}`));
    urls.forEach((url) => axiosMock.onGet(url).reply(401));

    const results = await Promise.allSettled(urls.map((url) => getAuthenticatedHttpClient().get(url)));

    expect(results.every((result) => result.status === 'rejected')).toBe(true);
    expect(assign).toHaveBeenCalledTimes(1);
  });

  it('does not redirect again when the last login did not restore the session', async () => {
    window.sessionStorage.setItem(LAST_REDIRECT_KEY, String(Date.now() - REDIRECT_COOLDOWN_MS / 2));
    axiosMock.onGet(studioUrl('/xblock/outline/block-1')).reply(401);

    await expect(getAuthenticatedHttpClient().get(studioUrl('/xblock/outline/block-1'))).rejects.toBeDefined();

    expect(assign).not.toHaveBeenCalled();
  });

  it('redirects again once the cooldown has passed', async () => {
    window.sessionStorage.setItem(LAST_REDIRECT_KEY, String(Date.now() - REDIRECT_COOLDOWN_MS * 2));
    axiosMock.onGet(studioUrl('/xblock/outline/block-1')).reply(401);

    await expect(getAuthenticatedHttpClient().get(studioUrl('/xblock/outline/block-1'))).rejects.toBeDefined();

    expect(assign).toHaveBeenCalledTimes(1);
  });

  it.each([403, 404, 500])('does not redirect when Studio answers %d', async (status) => {
    axiosMock.onGet(studioUrl('/xblock/outline/block-1')).reply(status);

    await expect(getAuthenticatedHttpClient().get(studioUrl('/xblock/outline/block-1'))).rejects.toBeDefined();

    expect(assign).not.toHaveBeenCalled();
  });

  it('does not retry a query that Studio answered with 401', async () => {
    axiosMock.onGet(studioUrl('/xblock/outline/block-1')).reply(401);
    const error = await getAuthenticatedHttpClient().get(studioUrl('/xblock/outline/block-1')).catch((e) => e);

    expect(shouldRetryQuery(0, error)).toBe(false);
  });

  it('retries other failed queries up to the React Query default', async () => {
    axiosMock.onGet(studioUrl('/xblock/outline/block-1')).reply(500);
    const error = await getAuthenticatedHttpClient().get(studioUrl('/xblock/outline/block-1')).catch((e) => e);

    expect(shouldRetryQuery(0, error)).toBe(true);
    expect(shouldRetryQuery(2, error)).toBe(true);
    expect(shouldRetryQuery(3, error)).toBe(false);
  });

  it('does not redirect for a 401 from another service', async () => {
    const lmsUrl = `${getConfig().LMS_BASE_URL}/login_refresh`;
    axiosMock.onPost(lmsUrl).reply(401);

    await expect(getAuthenticatedHttpClient().post(lmsUrl)).rejects.toBeDefined();

    expect(assign).not.toHaveBeenCalled();
  });
});
