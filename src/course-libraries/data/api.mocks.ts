import fetchMock from 'fetch-mock-jest';
import mockLinksResult from '../__mocks__/publishableEntityLinks.json';
import mockSummaryResult from '../__mocks__/linkCourseSummary.json';
import mockLinkDetailsFromIndex from '../__mocks__/linkDetailsFromIndex.json';
import mockLibBlockMetadata from '../__mocks__/libBlockMetadata.json';
import { createAxiosError } from '../../testUtils';
import * as api from './api';
import * as libApi from '../../library-authoring/data/api'

/**
 * Mock for `getEntityLinks()`
 *
 * This mock returns a fixed response for the downstreamContextKey.
 */
export async function mockGetEntityLinks(
  downstreamContextKey?: string,
  readyToSync?: boolean,
  _upstreamUsageKey?: string,
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
mockGetUnpaginatedEntityLinks.response = [mockLinksResult.results.slice(-2)];
mockGetUnpaginatedEntityLinks.emptyUsageKey = 'lb:Axim:TEST1:html:empty';
mockGetUnpaginatedEntityLinks.emptyComponentUsage = [] as api.PublishableEntityLink[];

mockGetUnpaginatedEntityLinks.applyMock = () => jest.spyOn(
  api,
  'getUnpaginatedEntityLinks',
).mockImplementation(mockGetUnpaginatedEntityLinks);

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
        (o: { readyToSyncCount: number }) => o.readyToSyncCount === 0
      ));
    default:
      return Promise.resolve(mockGetEntityLinksSummaryByDownstreamContext.response);
  }
}
mockGetEntityLinksSummaryByDownstreamContext.courseKey = mockLinksResult.results[0].downstreamContextKey;
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
