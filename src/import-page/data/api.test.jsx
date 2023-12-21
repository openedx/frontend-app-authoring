import MockAdapter from 'axios-mock-adapter';
import { initializeMockApp, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import { getImportStatus, postImportCourseApiUrl, startCourseImporting } from './api';

let axiosMock;
const courseId = 'course-123';

describe('API Functions', () => {
  beforeEach(() => {
    initializeMockApp({
      authenticatedUser: {
        userId: 3,
        username: 'abc123',
        administrator: true,
        roles: [],
      },
    });
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch status on start importing', async () => {
    const file = new File(['(⌐□_□)'], 'download.tar.gz', { size: 20 });
    const data = { importStatus: 1 };
    axiosMock.onPost(postImportCourseApiUrl(courseId)).reply(200, data);

    const result = await startCourseImporting(courseId, file, {}, jest.fn());
    expect(axiosMock.history.post[0].url).toEqual(postImportCourseApiUrl(courseId));
    expect(result).toEqual(data);
  });

  it('should fetch on get import status', async () => {
    const data = { importStatus: 2 };
    const fileName = 'testFileName.test';
    const queryUrl = new URL(`import_status/${courseId}/${fileName}`, getConfig().STUDIO_BASE_URL).href;
    axiosMock.onGet(queryUrl).reply(200, data);

    const result = await getImportStatus(courseId, fileName);

    expect(axiosMock.history.get[0].url).toEqual(queryUrl);
    expect(result).toEqual(data);
  });
});
