import { mockApiResponse } from '../mocks/mockApiResponse';
import { initializeMocks } from '@src/testUtils';
import * as api from './api';
import { LINK_CHECK_STATUSES } from './constants';

describe('Course Optimizer API', () => {
  describe('postLinkCheck', () => {
    it('should get an affirmative response on starting a scan', async () => {
      const { axiosMock } = initializeMocks();
      const courseId = 'course-123';
      const url = api.postLinkCheckCourseApiUrl(courseId);
      axiosMock.onPost(url).reply(202, { status: LINK_CHECK_STATUSES.PENDING });
      const data = await api.postLinkCheck(courseId);

      expect(data).toEqual({ linkCheckStatus: LINK_CHECK_STATUSES.PENDING });
      expect(axiosMock.history.post[0].data).toBeUndefined();
    });
  });

  describe('getLinkCheckStatus', () => {
    it('requests the full view, which carries the report', async () => {
      const { axiosMock } = initializeMocks();
      const courseId = 'course-123';
      axiosMock.onGet(api.getLinkCheckStatusApiUrl(courseId)).reply(200, mockApiResponse);

      await api.getLinkCheckStatus(courseId);

      expect(axiosMock.history.get[0].params).toEqual({ view: 'full' });
    });

    it('reports a course with no link check as uninitiated', async () => {
      const { axiosMock } = initializeMocks();
      const courseId = 'course-123';
      axiosMock.onGet(api.getLinkCheckStatusApiUrl(courseId)).reply(200, {
        status: 'Uninitiated',
        created_at: null,
        error: null,
        output: null,
      });

      await expect(api.getLinkCheckStatus(courseId)).resolves.toEqual({
        linkCheckStatus: LINK_CHECK_STATUSES.UNINITIATED,
        linkCheckOutput: null,
        linkCheckCreatedAt: null,
      });
    });

    it('reports a failed link check by its status only', async () => {
      const { axiosMock } = initializeMocks();
      const courseId = 'course-123';
      axiosMock.onGet(api.getLinkCheckStatusApiUrl(courseId)).reply(200, {
        status: 'Failed',
        created_at: '2024-12-14T00:26:50.838350Z',
        error: 'The link check could not be completed.',
        output: null,
      });

      await expect(api.getLinkCheckStatus(courseId)).resolves.toEqual({
        linkCheckStatus: LINK_CHECK_STATUSES.FAILED,
        linkCheckOutput: null,
        linkCheckCreatedAt: '2024-12-14T00:26:50.838350Z',
      });
    });

    it('should get the status of a scan', async () => {
      const { axiosMock } = initializeMocks();
      const courseId = 'course-123';
      const url = api.getLinkCheckStatusApiUrl(courseId);
      axiosMock.onGet(url).reply(200, mockApiResponse);
      const data = await api.getLinkCheckStatus(courseId);

      expect(data.linkCheckOutput).toEqual(mockApiResponse.output);
      expect(data.linkCheckStatus).toEqual(mockApiResponse.status);
      expect(data.linkCheckCreatedAt).toEqual(mockApiResponse.created_at);
    });

    it('camel-cases every member of the report', async () => {
      const { axiosMock } = initializeMocks();
      const courseId = 'course-123';
      const block = {
        id: 'block-v1:org+course+run+type@html+block@html-1',
        display_name: 'Text',
        url: '/container/block-v1:org+course+run+type@vertical+block@unit-1',
        broken_links: ['https://example.com/broken'],
        locked_links: ['/asset-v1:org+course+run+type@asset+block@locked.pdf'],
        external_forbidden_links: ['https://outsider.example.com/forbidden'],
        previous_run_links: [
          { original_link: '/course/course-v1:org+course+old_run', is_updated: false, updated_link: null },
          {
            original_link: '/course/course-v1:org+course+older_run',
            is_updated: true,
            updated_link: '/course/course-v1:org+course+run',
          },
        ],
      };
      const page = {
        ...block,
        id: 'handouts',
        display_name: 'Course Handouts',
        url: '/course_info/course-v1:org+course+run',
      };
      axiosMock.onGet(api.getLinkCheckStatusApiUrl(courseId)).reply(200, {
        status: 'Succeeded',
        created_at: '2024-12-14T00:26:50.838350Z',
        error: null,
        output: {
          sections: [{
            id: 'section-1',
            display_name: 'Section',
            subsections: [{
              id: 'subsection-1',
              display_name: 'Subsection',
              units: [{ id: 'unit-1', display_name: 'Unit', blocks: [block] }],
            }],
          }],
          course_updates: [page],
          custom_pages: [{ ...page, id: 'static_tab-1', display_name: 'About' }],
        },
      });

      const camelBlock = {
        id: 'block-v1:org+course+run+type@html+block@html-1',
        displayName: 'Text',
        url: '/container/block-v1:org+course+run+type@vertical+block@unit-1',
        brokenLinks: ['https://example.com/broken'],
        lockedLinks: ['/asset-v1:org+course+run+type@asset+block@locked.pdf'],
        externalForbiddenLinks: ['https://outsider.example.com/forbidden'],
        previousRunLinks: [
          { originalLink: '/course/course-v1:org+course+old_run', isUpdated: false, updatedLink: null },
          {
            originalLink: '/course/course-v1:org+course+older_run',
            isUpdated: true,
            updatedLink: '/course/course-v1:org+course+run',
          },
        ],
      };
      const camelPage = {
        ...camelBlock,
        id: 'handouts',
        displayName: 'Course Handouts',
        url: '/course_info/course-v1:org+course+run',
      };
      await expect(api.getLinkCheckStatus(courseId)).resolves.toEqual({
        linkCheckStatus: LINK_CHECK_STATUSES.SUCCEEDED,
        linkCheckCreatedAt: '2024-12-14T00:26:50.838350Z',
        linkCheckOutput: {
          sections: [{
            id: 'section-1',
            displayName: 'Section',
            subsections: [{
              id: 'subsection-1',
              displayName: 'Subsection',
              units: [{ id: 'unit-1', displayName: 'Unit', blocks: [camelBlock] }],
            }],
          }],
          courseUpdates: [camelPage],
          customPages: [{ ...camelPage, id: 'static_tab-1', displayName: 'About' }],
        },
      });
    });
  });

  describe('updateAllPreviousRunLinks', () => {
    it('should send a request to update all previous run links for a course', async () => {
      const { axiosMock } = initializeMocks();
      const courseId = 'course-123';
      const url = api.postRerunLinkUpdateApiUrl(courseId);
      const expectedResponse = { status: 'Pending' };
      axiosMock.onPost(url).reply(202, expectedResponse);

      const data = await api.postRerunLinkUpdateAll(courseId);

      expect(data).toEqual(expectedResponse);
      expect(axiosMock.history.post[0].data).toEqual(JSON.stringify({ action: 'all' }));
    });
  });

  describe('updatePreviousRunLink', () => {
    it('should send a request to update a single previous run link', async () => {
      const { axiosMock } = initializeMocks();
      const courseId = 'course-123';
      const url = api.postRerunLinkUpdateApiUrl(courseId);
      const expectedResponse = { status: 'Pending' };
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

      axiosMock.onPost(url).reply(202, expectedResponse);

      const data = await api.postRerunLinkUpdateSingle(courseId, linkUrl, blockId, contentType);

      expect(data).toEqual(expectedResponse);
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

      await expect(api.postLinkCheck(courseId)).rejects.toThrow('Request failed with status code 500');
    });

    it('should handle 404 errors', async () => {
      const { axiosMock } = initializeMocks();
      const courseId = 'course-123';
      const url = api.postLinkCheckCourseApiUrl(courseId);
      axiosMock.onPost(url).reply(404, {
        type: 'https://docs.openedx.org/errors/not-found',
        title: 'Not Found',
        status: 404,
        detail: 'Not found.',
        instance: '/api/authoring/v1/courses/course-123/link_check/',
      });

      await expect(api.postLinkCheck(courseId)).rejects.toThrow('Request failed with status code 404');
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

      await expect(api.getLinkCheckStatus(courseId)).rejects.toThrow('Request failed with status code 500');
    });

    it('should handle 403 errors', async () => {
      const { axiosMock } = initializeMocks();
      const courseId = 'course-123';
      const url = api.getLinkCheckStatusApiUrl(courseId);
      axiosMock.onGet(url).reply(403, {
        type: 'https://docs.openedx.org/errors/authz',
        title: 'Forbidden',
        status: 403,
        detail: 'You do not have permission to perform this action.',
        instance: '/api/authoring/v1/courses/course-123/link_check/',
      });

      await expect(api.getLinkCheckStatus(courseId)).rejects.toThrow('Request failed with status code 403');
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

      await expect(api.postRerunLinkUpdateAll(courseId)).rejects.toThrow('Request failed with status code 500');
    });
  });

  // Add error handling tests for postRerunLinkUpdateSingle
  describe('postRerunLinkUpdateSingle error handling', () => {
    it('should handle network errors', async () => {
      const { axiosMock } = initializeMocks();
      const courseId = 'course-123';
      const url = api.postRerunLinkUpdateApiUrl(courseId);
      axiosMock.onPost(url).networkError();

      await expect(api.postRerunLinkUpdateSingle(courseId, 'https://test.com', 'block-1')).rejects.toThrow(
        'Network Error',
      );
    });

    it('should handle server errors', async () => {
      const { axiosMock } = initializeMocks();
      const courseId = 'course-123';
      const url = api.postRerunLinkUpdateApiUrl(courseId);
      axiosMock.onPost(url).reply(500, { error: 'Update failed' });

      await expect(api.postRerunLinkUpdateSingle(courseId, 'https://test.com', 'block-1')).rejects.toThrow(
        'Request failed with status code 500',
      );
    });

    it('should use default contentType when not provided', async () => {
      const { axiosMock } = initializeMocks();
      const courseId = 'course-123';
      const url = api.postRerunLinkUpdateApiUrl(courseId);
      const expectedResponse = { status: 'Pending' };
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

      axiosMock.onPost(url).reply(202, expectedResponse);

      // Call without contentType parameter to test default
      const data = await api.postRerunLinkUpdateSingle(courseId, linkUrl, blockId);

      expect(data).toEqual(expectedResponse);
      expect(axiosMock.history.post[0].data).toEqual(JSON.stringify(expectedRequestBody));
    });
  });

  describe('getRerunLinkUpdateStatus', () => {
    it('requests the full view and returns camel-cased status and result fields', async () => {
      const { axiosMock } = initializeMocks();
      const courseId = 'course-123';
      const url = api.getRerunLinkUpdateStatusApiUrl(courseId);
      axiosMock.onGet(url).reply(200, {
        status: 'Succeeded',
        results: [
          {
            id: 'block-1',
            type: 'course_content',
            original_url: 'https://old.example.com',
            new_url: 'https://new.example.com',
            success: true,
            error_message: null,
          },
          {
            id: 'block-2',
            type: 'course_updates',
            original_url: 'https://old.example.com/2',
            new_url: 'https://old.example.com/2',
            success: false,
            error_message: 'The link could not be updated.',
          },
        ],
      });

      await expect(api.getRerunLinkUpdateStatus(courseId)).resolves.toEqual({
        status: 'Succeeded',
        results: [
          {
            id: 'block-1',
            type: 'course_content',
            originalUrl: 'https://old.example.com',
            newUrl: 'https://new.example.com',
            success: true,
            errorMessage: null,
          },
          {
            id: 'block-2',
            type: 'course_updates',
            originalUrl: 'https://old.example.com/2',
            newUrl: 'https://old.example.com/2',
            success: false,
            errorMessage: 'The link could not be updated.',
          },
        ],
      });
      expect(axiosMock.history.get[0].params).toEqual({ view: 'full' });
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

      await expect(api.getRerunLinkUpdateStatus(courseId)).rejects.toThrow('Request failed with status code 500');
    });
  });

  // Add tests for URL builders with edge cases
  describe('URL builders', () => {
    it('should build correct URLs', () => {
      const courseId = 'test-course-123';

      expect(api.postLinkCheckCourseApiUrl(courseId)).toMatch(
        /\/api\/authoring\/v1\/courses\/test-course-123\/link_check\/$/,
      );
      expect(api.getLinkCheckStatusApiUrl(courseId)).toEqual(api.postLinkCheckCourseApiUrl(courseId));
      expect(api.postRerunLinkUpdateApiUrl(courseId)).toMatch(
        /\/api\/authoring\/v1\/courses\/test-course-123\/previous_run_link_update\/$/,
      );
      expect(api.getRerunLinkUpdateStatusApiUrl(courseId)).toEqual(api.postRerunLinkUpdateApiUrl(courseId));
    });
  });
});
