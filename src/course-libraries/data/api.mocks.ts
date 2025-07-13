/* istanbul ignore file */
// eslint-disable-next-line import/no-extraneous-dependencies
import fetchMock from 'fetch-mock-jest';
import mockLinksResult from '../__mocks__/publishableEntityLinks.json';
import mockSummaryResult from '../__mocks__/linkCourseSummary.json';
import mockLinkDetailsFromIndex from '../__mocks__/linkDetailsFromIndex.json';
import mockLibBlockMetadata from '../__mocks__/libBlockMetadata.json';
import { createAxiosError } from '../../testUtils';
import * as api from './api';
import * as libApi from '../../library-authoring/data/api';

/**
 * Mock for `getComponentEntityLinks()`
 *
 * This mock returns a fixed response for the downstreamContextKey.
 */
export async function mockGetComponentEntityLinks(
  downstreamContextKey?: string,
  readyToSync?: boolean,
): ReturnType<typeof api.getComponentEntityLinks> {
  switch (downstreamContextKey) {
    case mockGetComponentEntityLinks.invalidCourseKey:
      throw createAxiosError({
        code: 404,
        message: 'Not found.',
        path: api.getEntityLinksByDownstreamContextUrl(),
      });
    case mockGetComponentEntityLinks.courseKeyLoading:
      return new Promise(() => {});
    case mockGetComponentEntityLinks.courseKeyEmpty:
      return Promise.resolve([]);
    default: {
      let { response } = mockGetComponentEntityLinks;
      if (readyToSync !== undefined) {
        response = response.filter((o) => o.readyToSync === readyToSync);
      }
      return Promise.resolve(response);
    }
  }
}
mockGetComponentEntityLinks.courseKey = mockLinksResult[0].downstreamContextKey;
mockGetComponentEntityLinks.invalidCourseKey = 'course_key_error';
mockGetComponentEntityLinks.courseKeyLoading = 'courseKeyLoading';
mockGetComponentEntityLinks.courseKeyEmpty = 'courseKeyEmpty';
mockGetComponentEntityLinks.response = mockLinksResult;
/** Apply this mock. Returns a spy object that can tell you if it's been called. */
mockGetComponentEntityLinks.applyMock = () => {
  jest.spyOn(api, 'getComponentEntityLinks').mockImplementation(mockGetComponentEntityLinks);
};

/**
 * Mock for `getEntityLinksSummaryByDownstreamContext()`
 *
 * This mock returns a fixed response for the downstreamContextKey.
 */
export async function mockGetEntityLinksSummaryByDownstreamContext(
  courseId?: string,
): ReturnType<typeof api.getEntityLinksSummaryByDownstreamContext> {
  switch (courseId) {
    case mockGetEntityLinksSummaryByDownstreamContext.invalidCourseKey:
      throw createAxiosError({
        code: 404,
        message: 'Not found.',
        path: api.getEntityLinksByDownstreamContextUrl(),
      });
    case mockGetEntityLinksSummaryByDownstreamContext.courseKeyLoading:
      return new Promise(() => {});
    case mockGetEntityLinksSummaryByDownstreamContext.courseKeyEmpty:
      return Promise.resolve([]);
    case mockGetEntityLinksSummaryByDownstreamContext.courseKeyUpToDate:
      return Promise.resolve(mockGetEntityLinksSummaryByDownstreamContext.response.filter(
        (o: { readyToSyncCount: number }) => o.readyToSyncCount === 0,
      ));
    default:
      return Promise.resolve(mockGetEntityLinksSummaryByDownstreamContext.response);
  }
}
mockGetEntityLinksSummaryByDownstreamContext.courseKey = mockLinksResult[0].downstreamContextKey;
mockGetEntityLinksSummaryByDownstreamContext.invalidCourseKey = 'course_key_error';
mockGetEntityLinksSummaryByDownstreamContext.courseKeyLoading = 'courseKeySummaryLoading';
mockGetEntityLinksSummaryByDownstreamContext.courseKeyEmpty = 'courseKeyEmpty';
mockGetEntityLinksSummaryByDownstreamContext.courseKeyUpToDate = 'courseKeyUpToDate';
mockGetEntityLinksSummaryByDownstreamContext.response = mockSummaryResult;
/** Apply this mock. Returns a spy object that can tell you if it's been called. */
mockGetEntityLinksSummaryByDownstreamContext.applyMock = () => {
  jest.spyOn(api, 'getEntityLinksSummaryByDownstreamContext').mockImplementation(mockGetEntityLinksSummaryByDownstreamContext);
};

/**
 * Mock for multi-search from meilisearch index for link details.
 */
export async function mockFetchIndexDocuments() {
  return mockLinkDetailsFromIndex;
}
mockFetchIndexDocuments.applyMock = () => {
  fetchMock.post(
    'http://mock.meilisearch.local/multi-search',
    mockFetchIndexDocuments,
    { overwriteRoutes: true },
  );
};

/**
 * Mock for library block metadata
 */
export async function mockUseLibBlockMetadata() {
  return mockLibBlockMetadata;
}
mockUseLibBlockMetadata.applyMock = () => {
  jest.spyOn(libApi, 'getLibraryBlockMetadata').mockImplementation(mockUseLibBlockMetadata);
};
