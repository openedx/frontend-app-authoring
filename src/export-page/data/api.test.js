import { getConfig } from '@edx/frontend-platform';
import { initializeMocks } from '@src/testUtils';

import { getExportStatus, postExportCourseApiUrl, startCourseExporting } from './api';

let axiosMock;
const courseId = 'course-123';

describe('API Functions', () => {
  beforeEach(() => {
    ({ axiosMock } = initializeMocks());
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch status on start exporting', async () => {
    const data = { exportStatus: 1 };
    axiosMock.onPost(postExportCourseApiUrl(courseId)).reply(200, data);

    const result = await startCourseExporting(courseId);

    expect(axiosMock.history.post[0].url).toEqual(postExportCourseApiUrl(courseId));
    expect(result).toEqual(data);
  });

  it('should fetch on get export status', async () => {
    const data = { exportStatus: 2 };
    const queryUrl = new URL(`export_status/${courseId}`, getConfig().STUDIO_BASE_URL).href;
    axiosMock.onGet(queryUrl).reply(200, data);

    const result = await getExportStatus(courseId);

    expect(axiosMock.history.get[0].url).toEqual(queryUrl);
    expect(result).toEqual(data);
  });
});
