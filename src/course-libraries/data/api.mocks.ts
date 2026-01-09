/* istanbul ignore file */
// eslint-disable-next-line import/no-extraneous-dependencies
import fetchMock from 'fetch-mock-jest';
import * as libApi from '@src/library-authoring/data/api';
import { createAxiosError } from '@src/testUtils';

import { UserTaskStatus } from '@src/data/constants';
import mockLinksResult from '../__mocks__/publishableEntityLinks.json';
import mockSummaryResult from '../__mocks__/linkCourseSummary.json';
import mockLinkDetailsFromIndex from '../__mocks__/linkDetailsFromIndex.json';
import mockLibBlockMetadata from '../__mocks__/libBlockMetadata.json';
import * as api from './api';

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
      return Promise.resolve([]);
    default: {
      let { response } = mockGetEntityLinks;
      if (readyToSync !== undefined) {
        response = response.filter((o) => o.readyToSync === readyToSync);
      }
      return Promise.resolve(response);
    }
  }
}
mockGetEntityLinks.courseKey = mockLinksResult[0].downstreamContextKey;
mockGetEntityLinks.invalidCourseKey = 'course_key_error';
mockGetEntityLinks.courseKeyLoading = 'courseKeyLoading';
mockGetEntityLinks.courseKeyEmpty = 'courseKeyEmpty';
mockGetEntityLinks.response = mockLinksResult;
/** Apply this mock. Returns a spy object that can tell you if it's been called. */
mockGetEntityLinks.applyMock = () => {
  jest.spyOn(api, 'getEntityLinks').mockImplementation(mockGetEntityLinks);
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
        path: api.getEntityLinksSummaryByDownstreamContextUrl(courseId),
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

/**
 * Mock getCourseReadyToMigrateLegacyLibContentBlocks
*/
export async function mockGetReadyToUpdateReferences(
  courseId?: string,
): ReturnType<typeof api.getCourseReadyToMigrateLegacyLibContentBlocks> {
  switch (courseId) {
    case mockGetReadyToUpdateReferences.courseKeyLoading:
      return new Promise(() => {});
    case mockGetReadyToUpdateReferences.courseKeyEmpty:
      return Promise.resolve([]);
    case mockGetReadyToUpdateReferences.courseKeyWith2Blocks:
      return Promise.resolve([{ usageKey: 'some-key-1' }, { usageKey: 'some-key-2' }]);
    case mockGetReadyToUpdateReferences.courseKeyWith3Blocks:
      return Promise.resolve([{ usageKey: 'some-key-1' }, { usageKey: 'some-key-2' }, { usageKey: 'some-key-3' }]);
    case mockGetReadyToUpdateReferences.courseKeyWith1Block:
      return Promise.resolve([{ usageKey: 'some-key-1' }]);
    default:
      throw Error();
  }
}
mockGetReadyToUpdateReferences.courseKeyLoading = 'course-v1:loading+1+1';
mockGetReadyToUpdateReferences.courseKeyEmpty = 'course-v1:empty+1+1';
mockGetReadyToUpdateReferences.courseKeyWith2Blocks = 'course-v1:normal+2+2';
mockGetReadyToUpdateReferences.courseKeyWith1Block = 'course-v1:normal+1+1';
mockGetReadyToUpdateReferences.courseKeyWith3Blocks = 'course-v1:normal+3+3';
mockGetReadyToUpdateReferences.applyMock = () => {
  jest.spyOn(api, 'getCourseReadyToMigrateLegacyLibContentBlocks').mockImplementation(mockGetReadyToUpdateReferences);
};

/**
 * Mock getCourseLegacyLibRefUpdateTaskStatus
*/
export async function mockGetCourseLegacyLibRefUpdateTaskStatus(
  _courseId?: string,
  taskId?: string,
): ReturnType<typeof api.getCourseLegacyLibRefUpdateTaskStatus> {
  switch (taskId) {
    case mockGetCourseLegacyLibRefUpdateTaskStatus.taskInProgress:
      return Promise.resolve({
        state: UserTaskStatus.InProgress,
        stateText: 'In Progress',
        uuid: 'task-pending',
      } as unknown as ReturnType<typeof api.getCourseLegacyLibRefUpdateTaskStatus>);
    case mockGetCourseLegacyLibRefUpdateTaskStatus.taskComplete:
      return Promise.resolve({
        state: UserTaskStatus.Succeeded,
        stateText: 'Succeeded',
        uuid: 'task-complete',
      } as unknown as ReturnType<typeof api.getCourseLegacyLibRefUpdateTaskStatus>);
    case mockGetCourseLegacyLibRefUpdateTaskStatus.taskFailed:
      return Promise.resolve({
        state: UserTaskStatus.Failed,
        stateText: 'Failed',
        uuid: 'task-failed',
      } as unknown as ReturnType<typeof api.getCourseLegacyLibRefUpdateTaskStatus>);
    default:
      throw Error();
  }
}
mockGetCourseLegacyLibRefUpdateTaskStatus.taskInProgress = 'task-pending';
mockGetCourseLegacyLibRefUpdateTaskStatus.taskComplete = 'task-complete';
mockGetCourseLegacyLibRefUpdateTaskStatus.taskFailed = 'task-failed';
mockGetCourseLegacyLibRefUpdateTaskStatus.applyMock = () => {
  jest.spyOn(api, 'getCourseLegacyLibRefUpdateTaskStatus').mockImplementation(mockGetCourseLegacyLibRefUpdateTaskStatus);
};

/**
 * Mock getCourseReadyToMigrateLegacyLibContentBlocks
*/
export async function mockMigrateCourseReadyToMigrateLegacyLibContentBlocks(
  courseId?: string,
): ReturnType<typeof api.migrateCourseReadyToMigrateLegacyLibContentBlocks> {
  switch (courseId) {
    case mockGetReadyToUpdateReferences.courseKeyWith2Blocks:
      return Promise.resolve({
        state: UserTaskStatus.InProgress,
        stateText: 'In Progress',
        uuid: 'task-pending',
      } as unknown as ReturnType<typeof api.migrateCourseReadyToMigrateLegacyLibContentBlocks>);
    case mockGetReadyToUpdateReferences.courseKeyWith1Block:
      return Promise.resolve({
        state: UserTaskStatus.InProgress,
        stateText: 'In Progress',
        uuid: 'task-complete',
      } as unknown as ReturnType<typeof api.migrateCourseReadyToMigrateLegacyLibContentBlocks>);
    case mockGetReadyToUpdateReferences.courseKeyWith3Blocks:
      return Promise.resolve({
        state: UserTaskStatus.InProgress,
        stateText: 'In Progress',
        uuid: 'task-failed',
      } as unknown as ReturnType<typeof api.migrateCourseReadyToMigrateLegacyLibContentBlocks>);
    default:
      throw Error();
  }
}
mockMigrateCourseReadyToMigrateLegacyLibContentBlocks.applyMock = () => {
  jest.spyOn(
    api,
    'migrateCourseReadyToMigrateLegacyLibContentBlocks',
  ).mockImplementation(mockMigrateCourseReadyToMigrateLegacyLibContentBlocks);
};
