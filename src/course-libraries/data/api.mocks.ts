import mockLinksResult from '../__mocks__/publishableEntityLinks.json';
import { createAxiosError } from '../../testUtils';
import * as api from './api';

/**
 * Mock for `getEntityLinksByDownstreamContext()`
 *
 * This mock returns a fixed response for the downstreamContextKey.
 */
export async function mockGetEntityLinks(
  downstreamContextKey?: string,
  readyToSync?: boolean,
): ReturnType<typeof api.getEntityLinks> {
  switch (downstreamContextKey) {
    case mockGetEntityLinks.invalidCourseKey:
      throw createAxiosError({
        code: 404,
        message: 'Not found.',
        path: api.getEntityLinksByDownstreamContextUrl(),
      });
    case mockGetEntityLinks.courseKeyLoading:
      return new Promise(() => {});
    case mockGetEntityLinks.courseKeyEmpty:
      return Promise.resolve({
        next: null,
        previous: null,
        count: 0,
        num_pages: 0,
        current_page: 0,
        results: [],
      });
    default:
      const response: api.PaginatedData<api.PublishableEntityLink[]> = mockGetEntityLinks.response;
      if (readyToSync !== undefined) {
        response.results = response.results.filter((o) => o.readyToSync == readyToSync);
        response.count = response.results.length;
      }
      return Promise.resolve(response);
  }
}
mockGetEntityLinks.courseKey = mockLinksResult.results[0].downstreamContextKey;
mockGetEntityLinks.invalidCourseKey = 'course_key_error';
mockGetEntityLinks.courseKeyLoading = 'courseKeyLoading';
mockGetEntityLinks.courseKeyEmpty = 'courseKeyEmpty';
mockGetEntityLinks.response = mockLinksResult;
/** Apply this mock. Returns a spy object that can tell you if it's been called. */
mockGetEntityLinks.applyMock = () => {
  jest.spyOn(api, 'getEntityLinks').mockImplementation(mockGetEntityLinks);
};

export async function mockGetUnpaginatedEntityLinks(
  _downstreamContextKey?: string,
  _readyToSync?: boolean,
  upstreamUsageKey?: string,
): ReturnType<typeof api.getUnpaginatedEntityLinks> {
  const thisMock = mockGetUnpaginatedEntityLinks;
  switch (upstreamUsageKey) {
    case thisMock.upstreamUsageKey: return thisMock.response;
    case thisMock.emptyUsageKey: return thisMock.emptyComponentUsage;
    default: return [];
  }
}
mockGetUnpaginatedEntityLinks.upstreamUsageKey = mockLinksResult.results.at(-1).upstreamUsageKey;
mockGetUnpaginatedEntityLinks.response = [mockLinksResult.results.at(-1)];
mockGetUnpaginatedEntityLinks.emptyUsageKey = 'lb:Axim:TEST1:html:empty';
mockGetUnpaginatedEntityLinks.emptyComponentUsage = [] as api.PublishableEntityLink[];

mockGetUnpaginatedEntityLinks.applyMock = () => jest.spyOn(
  api,
  'getUnpaginatedEntityLinks',
).mockImplementation(mockGetUnpaginatedEntityLinks);
