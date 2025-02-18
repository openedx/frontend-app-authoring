import mockLinksResult from '../__mocks__/publishableEntityLinks.json';
import { createAxiosError } from '../../testUtils';
import * as api from './api';

/**
 * Mock for `getEntityLinksByDownstreamContext()`
 *
 * This mock returns a fixed response for the downstreamContextKey.
 */
export async function mockGetEntityLinksByDownstreamContext(
  downstreamContextKey: string,
): Promise<api.PublishableEntityLink[]> {
  switch (downstreamContextKey) {
    case mockGetEntityLinksByDownstreamContext.invalidCourseKey:
      throw createAxiosError({
        code: 404,
        message: 'Not found.',
        path: api.getEntityLinksByDownstreamContextUrl(downstreamContextKey),
      });
    case mockGetEntityLinksByDownstreamContext.courseKeyLoading:
      return new Promise(() => {});
    case mockGetEntityLinksByDownstreamContext.courseKeyEmpty:
      return Promise.resolve([]);
    default:
      return Promise.resolve(mockGetEntityLinksByDownstreamContext.response);
  }
}
mockGetEntityLinksByDownstreamContext.courseKey = mockLinksResult[0].downstreamContextKey;
mockGetEntityLinksByDownstreamContext.invalidCourseKey = 'course_key_error';
mockGetEntityLinksByDownstreamContext.courseKeyLoading = 'courseKeyLoading';
mockGetEntityLinksByDownstreamContext.courseKeyEmpty = 'courseKeyEmpty';
mockGetEntityLinksByDownstreamContext.response = mockLinksResult;
/** Apply this mock. Returns a spy object that can tell you if it's been called. */
mockGetEntityLinksByDownstreamContext.applyMock = () => {
  jest.spyOn(api, 'getEntityLinksByDownstreamContext').mockImplementation(mockGetEntityLinksByDownstreamContext);
};
