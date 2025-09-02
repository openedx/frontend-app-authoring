import { mockApiResponse } from '../mocks/mockApiResponse';
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

  describe('updateAllPreviousRunLinks', () => {
    it('should send a request to update all previous run links for a course', async () => {
      const { axiosMock } = initializeMocks();
      const courseId = 'course-123';
      const url = api.postRerunLinkUpdateApiUrl(courseId);
      const expectedResponse = { success: true };
      axiosMock.onPost(url).reply(200, expectedResponse);

      const data = await api.postRerunLinkUpdateAll(courseId);

      expect(data).toEqual(expectedResponse);
      expect(axiosMock.history.post[0].url).toEqual(url);
      expect(axiosMock.history.post[0].data).toEqual(JSON.stringify({ action: 'all' }));
    });
  });

  describe('updatePreviousRunLink', () => {
    it('should send a request to update a single previous run link', async () => {
      const { axiosMock } = initializeMocks();
      const courseId = 'course-123';
      const url = api.postRerunLinkUpdateApiUrl(courseId);
      const expectedResponse = { success: true };
      const linkUrl = 'https://old.example.com/link';
      const blockId = 'block-id-123';
      const contentType = 'sections';
      const expectedRequestBody = {
        action: 'single',
        data: [{
          id: blockId,
          type: contentType,
          url: linkUrl,
        }],
      };

      axiosMock.onPost(url).reply(200, expectedResponse);

      const data = await api.postRerunLinkUpdateSingle(courseId, linkUrl, blockId, contentType);

      expect(data).toEqual(expectedResponse);
      expect(axiosMock.history.post[0].url).toEqual(url);
      expect(axiosMock.history.post[0].data).toEqual(JSON.stringify(expectedRequestBody));
    });
  });

  // Add error handling tests for postLinkCheck
  describe('postLinkCheck error handling', () => {
    it('should handle network errors', async () => {
      const { axiosMock } = initializeMocks();
      const courseId = 'course-123';
      const url = api.postLinkCheckCourseApiUrl(courseId);
      axiosMock.onPost(url).networkError();

      await expect(api.postLinkCheck(courseId)).rejects.toThrow('Network Error');
    });

    it('should handle server errors', async () => {
      const { axiosMock } = initializeMocks();
      const courseId = 'course-123';
      const url = api.postLinkCheckCourseApiUrl(courseId);
      axiosMock.onPost(url).reply(500, { error: 'Internal Server Error' });

      await expect(api.postLinkCheck(courseId)).rejects.toThrow();
    });

    it('should handle 404 errors', async () => {
      const { axiosMock } = initializeMocks();
      const courseId = 'course-123';
      const url = api.postLinkCheckCourseApiUrl(courseId);
      axiosMock.onPost(url).reply(404, { error: 'Not Found' });

      await expect(api.postLinkCheck(courseId)).rejects.toThrow();
    });
  });

  // Add error handling tests for getLinkCheckStatus
  describe('getLinkCheckStatus error handling', () => {
    it('should handle network errors', async () => {
      const { axiosMock } = initializeMocks();
      const courseId = 'course-123';
      const url = api.getLinkCheckStatusApiUrl(courseId);
      axiosMock.onGet(url).networkError();

      await expect(api.getLinkCheckStatus(courseId)).rejects.toThrow('Network Error');
    });

    it('should handle server errors', async () => {
      const { axiosMock } = initializeMocks();
      const courseId = 'course-123';
      const url = api.getLinkCheckStatusApiUrl(courseId);
      axiosMock.onGet(url).reply(500, { error: 'Internal Server Error' });

      await expect(api.getLinkCheckStatus(courseId)).rejects.toThrow();
    });

    it('should handle 403 errors', async () => {
      const { axiosMock } = initializeMocks();
      const courseId = 'course-123';
      const url = api.getLinkCheckStatusApiUrl(courseId);
      axiosMock.onGet(url).reply(403, { error: 'Forbidden' });

      await expect(api.getLinkCheckStatus(courseId)).rejects.toThrow();
    });
  });

  // Add error handling tests for postRerunLinkUpdateAll
  describe('postRerunLinkUpdateAll error handling', () => {
    it('should handle network errors', async () => {
      const { axiosMock } = initializeMocks();
      const courseId = 'course-123';
      const url = api.postRerunLinkUpdateApiUrl(courseId);
      axiosMock.onPost(url).networkError();

      await expect(api.postRerunLinkUpdateAll(courseId)).rejects.toThrow('Network Error');
    });

    it('should handle server errors', async () => {
      const { axiosMock } = initializeMocks();
      const courseId = 'course-123';
      const url = api.postRerunLinkUpdateApiUrl(courseId);
      axiosMock.onPost(url).reply(500, { error: 'Update failed' });

      await expect(api.postRerunLinkUpdateAll(courseId)).rejects.toThrow();
    });
  });

  // Add error handling tests for postRerunLinkUpdateSingle
  describe('postRerunLinkUpdateSingle error handling', () => {
    it('should handle network errors', async () => {
      const { axiosMock } = initializeMocks();
      const courseId = 'course-123';
      const url = api.postRerunLinkUpdateApiUrl(courseId);
      axiosMock.onPost(url).networkError();

      await expect(api.postRerunLinkUpdateSingle(courseId, 'https://test.com', 'block-1')).rejects.toThrow('Network Error');
    });

    it('should handle server errors', async () => {
      const { axiosMock } = initializeMocks();
      const courseId = 'course-123';
      const url = api.postRerunLinkUpdateApiUrl(courseId);
      axiosMock.onPost(url).reply(500, { error: 'Update failed' });

      await expect(api.postRerunLinkUpdateSingle(courseId, 'https://test.com', 'block-1')).rejects.toThrow();
    });

    it('should use default contentType when not provided', async () => {
      const { axiosMock } = initializeMocks();
      const courseId = 'course-123';
      const url = api.postRerunLinkUpdateApiUrl(courseId);
      const expectedResponse = { success: true };
      const linkUrl = 'https://old.example.com/link';
      const blockId = 'block-id-123';
      const expectedRequestBody = {
        action: 'single',
        data: [{
          id: blockId,
          type: 'course_updates', // default value
          url: linkUrl,
        }],
      };

      axiosMock.onPost(url).reply(200, expectedResponse);

      // Call without contentType parameter to test default
      const data = await api.postRerunLinkUpdateSingle(courseId, linkUrl, blockId);

      expect(data).toEqual(expectedResponse);
      expect(axiosMock.history.post[0].data).toEqual(JSON.stringify(expectedRequestBody));
    });
  });

  // Add tests for the missing getRerunLinkUpdateStatus function
  describe('getRerunLinkUpdateStatus', () => {
    it('should get the status of previous run link updates', async () => {
      const { axiosMock } = initializeMocks();
      const courseId = 'course-123';
      const url = api.getRerunLinkUpdateStatusApiUrl(courseId);
      const expectedResponse = {
        UpdateStatus: 'Succeeded',
      };
      axiosMock.onGet(url).reply(200, expectedResponse);

      const data = await api.getRerunLinkUpdateStatus(courseId);

      expect(data.updateStatus).toEqual(expectedResponse.UpdateStatus);
      expect(axiosMock.history.get[0].url).toEqual(url);
    });

    it('should handle network errors', async () => {
      const { axiosMock } = initializeMocks();
      const courseId = 'course-123';
      const url = api.getRerunLinkUpdateStatusApiUrl(courseId);
      axiosMock.onGet(url).networkError();

      await expect(api.getRerunLinkUpdateStatus(courseId)).rejects.toThrow('Network Error');
    });

    it('should handle server errors', async () => {
      const { axiosMock } = initializeMocks();
      const courseId = 'course-123';
      const url = api.getRerunLinkUpdateStatusApiUrl(courseId);
      axiosMock.onGet(url).reply(500, { error: 'Internal Server Error' });

      await expect(api.getRerunLinkUpdateStatus(courseId)).rejects.toThrow();
    });
  });

  // Add tests for URL builders with edge cases
  describe('URL builders', () => {
    it('should build correct URLs', () => {
      const courseId = 'test-course-123';

      expect(api.postLinkCheckCourseApiUrl(courseId)).toMatch(/\/api\/contentstore\/v0\/link_check\/test-course-123$/);
      expect(api.getLinkCheckStatusApiUrl(courseId)).toMatch(/\/api\/contentstore\/v0\/link_check_status\/test-course-123$/);
      expect(api.postRerunLinkUpdateApiUrl(courseId)).toMatch(/\/api\/contentstore\/v0\/rerun_link_update\/test-course-123$/);
      expect(api.getRerunLinkUpdateStatusApiUrl(courseId)).toMatch(/\/api\/contentstore\/v0\/rerun_link_update_status\/test-course-123$/);
    });
  });
});
