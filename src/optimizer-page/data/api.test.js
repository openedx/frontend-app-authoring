import mockApiResponse from '../mocks/mockApiResponse';
import { initializeMocks } from '../../testUtils';
import * as api from './api';
import { LINK_CHECK_STATUSES } from './constants';

describe('Course Optimizer API', () => {
  describe('postLinkCheck', () => {
    it('should get an affirmative response on starting a scan', async () => {
      const { axiosMock } = initializeMocks();
      const courseId = 'course-123';
      const url = api.postLinkCheckCourseApiUrl(courseId);
      axiosMock.onPost(url).reply(200, { LinkCheckStatus: LINK_CHECK_STATUSES.IN_PROGRESS });
      const data = await api.postLinkCheck(courseId);

      expect(data.linkCheckStatus).toEqual(LINK_CHECK_STATUSES.IN_PROGRESS);
      expect(axiosMock.history.post[0].url).toEqual(url);
    });
  });

  describe('getLinkCheckStatus', () => {
    it('should get the status of a scan', async () => {
      const { axiosMock } = initializeMocks();
      const courseId = 'course-123';
      const url = api.getLinkCheckStatusApiUrl(courseId);
      axiosMock.onGet(url).reply(200, mockApiResponse);
      const data = await api.getLinkCheckStatus(courseId);

      expect(data.linkCheckOutput).toEqual(mockApiResponse.LinkCheckOutput);
      expect(data.linkCheckStatus).toEqual(mockApiResponse.LinkCheckStatus);
      expect(data.linkCheckCreatedAt).toEqual(mockApiResponse.LinkCheckCreatedAt);
      expect(axiosMock.history.get[0].url).toEqual(url);
    });
  });
});
