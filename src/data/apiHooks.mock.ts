import { waffleFlagDefaults, WaffleFlagName } from './api';
import * as apiHooks from './apiHooks';

/**
 * For testing purposes, override the waffle flags (which enable/disable
 * specific features). This will completely bypass React Query's waffle flag
 * loading; if you need more realistic handling, use:
 *   axiosMock
 *    .onGet(getApiWaffleFlagsUrl(courseId))
 *    .reply(200, { useNewCourseOutlinePage: true }); // etc
 */
export function mockWaffleFlags(overrides: Partial<Record<WaffleFlagName, boolean>> = {}) {
  return jest.spyOn(apiHooks, 'useWaffleFlags').mockImplementation(() => ({
    id: undefined,
    isLoading: false,
    isError: false,
    ...waffleFlagDefaults,
    ...overrides,
  }));
}
