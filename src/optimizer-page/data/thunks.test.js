import {
  startLinkCheck,
  fetchLinkCheckStatus,
  updateAllPreviousRunLinks,
  updateSinglePreviousRunLink,
  fetchRerunLinkUpdateStatus,
} from './thunks';
import * as api from './api';
import { LINK_CHECK_STATUSES } from './constants';
import { RequestStatus } from '../../data/constants';
import { mockApiResponse } from '../mocks/mockApiResponse';

describe('startLinkCheck thunk', () => {
  const dispatch = jest.fn();
  const getState = jest.fn();
  const courseId = 'course-123';
  let mockGetStartLinkCheck;

  beforeEach(() => {
    jest.clearAllMocks();

    mockGetStartLinkCheck = jest.spyOn(api, 'postLinkCheck').mockResolvedValue({
      linkCheckStatus: LINK_CHECK_STATUSES.IN_PROGRESS,
    });
  });

  describe('successful request', () => {
    it('should set link check stage and request statuses to their in-progress states', async () => {
      const inPendingStageId = 0;
      await startLinkCheck(courseId)(dispatch, getState);

      expect(dispatch).toHaveBeenCalledWith({
        payload: { status: RequestStatus.PENDING },
        type: 'courseOptimizer/updateSavingStatus',
      });

      expect(dispatch).toHaveBeenCalledWith({
        payload: true,
        type: 'courseOptimizer/updateLinkCheckInProgress',
      });

      expect(dispatch).toHaveBeenCalledWith({
        payload: { status: RequestStatus.SUCCESSFUL },
        type: 'courseOptimizer/updateSavingStatus',
      });

      expect(dispatch).toHaveBeenCalledWith({
        payload: inPendingStageId,
        type: 'courseOptimizer/updateCurrentStage',
      });
    });
  });

  describe('failed request should set stage and request ', () => {
    it('should set request status to failed', async () => {
      mockGetStartLinkCheck.mockRejectedValue(new Error('error'));

      await startLinkCheck(courseId)(dispatch, getState);

      expect(dispatch).toHaveBeenCalledWith({
        payload: { status: RequestStatus.FAILED },
        type: 'courseOptimizer/updateSavingStatus',
      });
      expect(dispatch).toHaveBeenCalledWith({
        payload: false,
        type: 'courseOptimizer/updateLinkCheckInProgress',
      });
      expect(dispatch).toHaveBeenCalledWith({
        payload: 1,
        type: 'courseOptimizer/updateCurrentStage',
      });
    });
  });
});

describe('fetchLinkCheckStatus thunk', () => {
  const dispatch = jest.fn();
  const getState = jest.fn();
  const courseId = 'course-123';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('successful request', () => {
    it('should return scan result', async () => {
      jest
        .spyOn(api, 'getLinkCheckStatus')
        .mockResolvedValue({
          linkCheckStatus: mockApiResponse.LinkCheckStatus,
          linkCheckOutput: mockApiResponse.LinkCheckOutput,
          linkCheckCreatedAt: mockApiResponse.LinkCheckCreatedAt,
        });

      await fetchLinkCheckStatus(courseId)(dispatch, getState);

      expect(dispatch).toHaveBeenCalledWith({
        payload: false,
        type: 'courseOptimizer/updateLinkCheckInProgress',
      });

      expect(dispatch).toHaveBeenCalledWith({
        payload: 2,
        type: 'courseOptimizer/updateCurrentStage',
      });

      expect(dispatch).toHaveBeenCalledWith({
        payload: mockApiResponse.LinkCheckOutput,
        type: 'courseOptimizer/updateLinkCheckResult',
      });

      expect(dispatch).toHaveBeenCalledWith({
        payload: { status: RequestStatus.SUCCESSFUL },
        type: 'courseOptimizer/updateLoadingStatus',
      });
    });

    it('with link check in progress should set current stage to 1', async () => {
      jest
        .spyOn(api, 'getLinkCheckStatus')
        .mockResolvedValue({
          linkCheckStatus: LINK_CHECK_STATUSES.IN_PROGRESS,
        });

      await fetchLinkCheckStatus(courseId)(dispatch, getState);

      expect(dispatch).toHaveBeenCalledWith({
        payload: 1,
        type: 'courseOptimizer/updateCurrentStage',
      });
    });
  });

  describe('failed request', () => {
    it('should set request status to failed', async () => {
      jest
        .spyOn(api, 'getLinkCheckStatus')
        .mockRejectedValue(new Error('error'));

      await fetchLinkCheckStatus(courseId)(dispatch, getState);

      expect(dispatch).toHaveBeenCalledWith({
        payload: { status: RequestStatus.FAILED },
        type: 'courseOptimizer/updateLoadingStatus',
      });
    });
  });

  describe('unauthorized request', () => {
    it('should set request status to denied', async () => {
      jest.spyOn(api, 'getLinkCheckStatus').mockRejectedValue({ response: { status: 403 } });
      await fetchLinkCheckStatus(courseId)(dispatch, getState);

      expect(dispatch).toHaveBeenCalledWith({
        payload: { status: RequestStatus.DENIED },
        type: 'courseOptimizer/updateLoadingStatus',
      });
    });
  });

  describe('failed scan', () => {
    it('should set error message', async () => {
      jest
        .spyOn(api, 'getLinkCheckStatus')
        .mockResolvedValue({
          linkCheckStatus: LINK_CHECK_STATUSES.FAILED,
          linkCheckOutput: mockApiResponse.LinkCheckOutput,
          linkCheckCreatedAt: mockApiResponse.LinkCheckCreatedAt,
        });

      await fetchLinkCheckStatus(courseId)(dispatch, getState);

      expect(dispatch).toHaveBeenCalledWith({
        payload: true,
        type: 'courseOptimizer/updateIsErrorModalOpen',
      });

      expect(dispatch).toHaveBeenCalledWith({
        payload: { msg: 'Link Check Failed' },
        type: 'courseOptimizer/updateError',
      });

      expect(dispatch).toHaveBeenCalledWith({
        payload: { status: RequestStatus.SUCCESSFUL },
        type: 'courseOptimizer/updateLoadingStatus',
      });

      expect(dispatch).toHaveBeenCalledWith({
        payload: 1,
        type: 'courseOptimizer/updateCurrentStage',
      });

      expect(dispatch).not.toHaveBeenCalledWith({
        payload: expect.anything(),
        type: 'courseOptimizer/updateLinkCheckResult',
      });
    });
  });
});

describe('updateAllPreviousRunLinks', () => {
  const dispatch = jest.fn();
  const getState = jest.fn();
  const courseId = 'course-123';
  let mockPostRerunLinkUpdateAll;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPostRerunLinkUpdateAll = jest.spyOn(api, 'postRerunLinkUpdateAll').mockResolvedValue({
      success: true,
    });
  });

  describe('successful request', () => {
    it('should dispatch success actions when updating all previous run links', async () => {
      await updateAllPreviousRunLinks(courseId)(dispatch, getState);

      expect(dispatch).toHaveBeenCalledWith({
        payload: { status: RequestStatus.PENDING },
        type: 'courseOptimizer/updateSavingStatus',
      });

      expect(dispatch).toHaveBeenCalledWith({
        payload: { status: RequestStatus.SUCCESSFUL },
        type: 'courseOptimizer/updateSavingStatus',
      });

      expect(mockPostRerunLinkUpdateAll).toHaveBeenCalledWith(courseId);
    });
  });

  describe('failed request', () => {
    it('should dispatch failed action when update fails', async () => {
      mockPostRerunLinkUpdateAll.mockRejectedValue(new Error('API error'));

      try {
        await updateAllPreviousRunLinks(courseId)(dispatch, getState);
      } catch (error) {
        // Expected to throw
      }

      expect(dispatch).toHaveBeenCalledWith({
        payload: { status: RequestStatus.PENDING },
        type: 'courseOptimizer/updateSavingStatus',
      });

      expect(dispatch).toHaveBeenCalledWith({
        payload: { status: RequestStatus.FAILED },
        type: 'courseOptimizer/updateSavingStatus',
      });
    });
  });
});

describe('updateSinglePreviousRunLink', () => {
  const dispatch = jest.fn();
  const getState = jest.fn();
  const courseId = 'course-123';
  const linkUrl = 'https://old.example.com/link';
  const blockId = 'block-id-123';
  const contentType = 'sections';
  let mockPostRerunLinkUpdateSingle;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPostRerunLinkUpdateSingle = jest.spyOn(api, 'postRerunLinkUpdateSingle').mockResolvedValue({
      success: true,
    });
  });

  describe('successful request', () => {
    it('should dispatch success actions when updating a single previous run link', async () => {
      await updateSinglePreviousRunLink(courseId, linkUrl, blockId, contentType)(dispatch, getState);

      expect(dispatch).toHaveBeenCalledWith({
        payload: { status: RequestStatus.PENDING },
        type: 'courseOptimizer/updateSavingStatus',
      });

      expect(dispatch).toHaveBeenCalledWith({
        payload: { status: RequestStatus.SUCCESSFUL },
        type: 'courseOptimizer/updateSavingStatus',
      });

      expect(mockPostRerunLinkUpdateSingle).toHaveBeenCalledWith(courseId, linkUrl, blockId, contentType);
    });
  });

  describe('failed request', () => {
    it('should dispatch failed action when update fails', async () => {
      mockPostRerunLinkUpdateSingle.mockRejectedValue(new Error('API error'));

      try {
        await updateSinglePreviousRunLink(courseId, linkUrl, blockId, contentType)(dispatch, getState);
      } catch (error) {
        // Expected to throw
      }

      expect(dispatch).toHaveBeenCalledWith({
        payload: { status: RequestStatus.PENDING },
        type: 'courseOptimizer/updateSavingStatus',
      });

      expect(dispatch).toHaveBeenCalledWith({
        payload: { status: RequestStatus.FAILED },
        type: 'courseOptimizer/updateSavingStatus',
      });
    });
  });
});

// Add tests for fetchRerunLinkUpdateStatus which is missing
describe('fetchRerunLinkUpdateStatus', () => {
  const dispatch = jest.fn();
  const getState = jest.fn();
  const courseId = 'course-123';
  let mockGetRerunLinkUpdateStatus;

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetRerunLinkUpdateStatus = jest.spyOn(api, 'getRerunLinkUpdateStatus');
  });

  describe('successful request with in-progress status', () => {
    it('should set rerun link update in progress to true', async () => {
      mockGetRerunLinkUpdateStatus.mockResolvedValue({
        status: 'In Progress',
        updateStatus: 'Pending',
      });

      const result = await fetchRerunLinkUpdateStatus(courseId)(dispatch, getState);

      expect(dispatch).toHaveBeenCalledWith({
        payload: true,
        type: 'courseOptimizer/updateRerunLinkUpdateInProgress',
      });

      expect(result.status).toBe('In Progress');
    });
  });

  describe('successful request with succeeded status', () => {
    it('should set rerun link update in progress to false', async () => {
      mockGetRerunLinkUpdateStatus.mockResolvedValue({
        status: 'Succeeded',
        updateStatus: 'Succeeded',
        results: [],
      });

      const result = await fetchRerunLinkUpdateStatus(courseId)(dispatch, getState);

      expect(dispatch).toHaveBeenCalledWith({
        payload: false,
        type: 'courseOptimizer/updateRerunLinkUpdateInProgress',
      });

      expect(result.status).toBe('Succeeded');
    });
  });

  describe('successful request with failed status', () => {
    it('should set rerun link update in progress to false', async () => {
      mockGetRerunLinkUpdateStatus.mockResolvedValue({
        status: 'Failed',
        updateStatus: 'Failed',
        results: [],
      });

      const result = await fetchRerunLinkUpdateStatus(courseId)(dispatch, getState);

      expect(dispatch).toHaveBeenCalledWith({
        payload: false,
        type: 'courseOptimizer/updateRerunLinkUpdateInProgress',
      });

      expect(result.status).toBe('Failed');
    });
  });

  describe('failed request', () => {
    it('should set rerun link update in progress to false on error', async () => {
      mockGetRerunLinkUpdateStatus.mockRejectedValue(new Error('API error'));

      try {
        await fetchRerunLinkUpdateStatus(courseId)(dispatch, getState);
      } catch (error) {
        // Expected to throw
      }

      expect(dispatch).toHaveBeenCalledWith({
        payload: false,
        type: 'courseOptimizer/updateRerunLinkUpdateInProgress',
      });
    });
  });
});

// Add more edge cases for existing thunks
describe('startLinkCheck additional edge cases', () => {
  const dispatch = jest.fn();
  const getState = jest.fn();
  const courseId = 'course-123';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle specific HTTP error codes', async () => {
    jest.spyOn(api, 'postLinkCheck').mockRejectedValue({
      response: { status: 403, data: { error: 'Forbidden' } },
    });

    await startLinkCheck(courseId)(dispatch, getState);

    expect(dispatch).toHaveBeenCalledWith({
      payload: { status: RequestStatus.FAILED },
      type: 'courseOptimizer/updateSavingStatus',
    });
  });

  it('should handle network errors', async () => {
    jest.spyOn(api, 'postLinkCheck').mockRejectedValue(new Error('Network Error'));

    await startLinkCheck(courseId)(dispatch, getState);

    expect(dispatch).toHaveBeenCalledWith({
      payload: { status: RequestStatus.FAILED },
      type: 'courseOptimizer/updateSavingStatus',
    });
  });

  it('should reset error state before starting scan', async () => {
    jest.spyOn(api, 'postLinkCheck').mockResolvedValue({
      linkCheckStatus: LINK_CHECK_STATUSES.IN_PROGRESS,
    });

    await startLinkCheck(courseId)(dispatch, getState);

    expect(dispatch).toHaveBeenCalledWith({
      payload: { msg: null, unitUrl: null },
      type: 'courseOptimizer/updateError',
    });
  });
});

describe('fetchLinkCheckStatus additional edge cases', () => {
  const dispatch = jest.fn();
  const getState = jest.fn();
  const courseId = 'course-123';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle link check status of null', async () => {
    jest.spyOn(api, 'getLinkCheckStatus').mockResolvedValue({
      linkCheckStatus: null,
      linkCheckOutput: [],
      linkCheckCreatedAt: '2024-01-01T00:00:00Z',
    });

    await fetchLinkCheckStatus(courseId)(dispatch, getState);

    expect(dispatch).toHaveBeenCalledWith({
      payload: { msg: 'Link Check Failed' },
      type: 'courseOptimizer/updateError',
    });

    expect(dispatch).toHaveBeenCalledWith({
      payload: true,
      type: 'courseOptimizer/updateIsErrorModalOpen',
    });
  });

  it('should handle undefined link check status', async () => {
    jest.spyOn(api, 'getLinkCheckStatus').mockResolvedValue({
      linkCheckStatus: undefined,
      linkCheckOutput: [],
      linkCheckCreatedAt: '2024-01-01T00:00:00Z',
    });

    await fetchLinkCheckStatus(courseId)(dispatch, getState);

    expect(dispatch).toHaveBeenCalledWith({
      payload: { msg: 'Link Check Failed' },
      type: 'courseOptimizer/updateError',
    });
  });

  it('should handle link check succeeded with no output', async () => {
    jest.spyOn(api, 'getLinkCheckStatus').mockResolvedValue({
      linkCheckStatus: LINK_CHECK_STATUSES.SUCCEEDED,
      linkCheckOutput: null,
      linkCheckCreatedAt: '2024-01-01T00:00:00Z',
    });

    await fetchLinkCheckStatus(courseId)(dispatch, getState);

    expect(dispatch).toHaveBeenCalledWith({
      payload: [],
      type: 'courseOptimizer/updateLinkCheckResult',
    });
  });

  it('should handle 404 errors', async () => {
    jest.spyOn(api, 'getLinkCheckStatus').mockRejectedValue({ response: { status: 404 } });

    await fetchLinkCheckStatus(courseId)(dispatch, getState);

    expect(dispatch).toHaveBeenCalledWith({
      payload: { status: RequestStatus.FAILED },
      type: 'courseOptimizer/updateLoadingStatus',
    });
  });

  it('should handle 500 errors', async () => {
    jest.spyOn(api, 'getLinkCheckStatus').mockRejectedValue({ response: { status: 500 } });

    await fetchLinkCheckStatus(courseId)(dispatch, getState);

    expect(dispatch).toHaveBeenCalledWith({
      payload: { status: RequestStatus.FAILED },
      type: 'courseOptimizer/updateLoadingStatus',
    });
  });
});

describe('updateAllPreviousRunLinks additional edge cases', () => {
  const dispatch = jest.fn();
  const getState = jest.fn();
  const courseId = 'course-123';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle HTTP 403 errors', async () => {
    jest.spyOn(api, 'postRerunLinkUpdateAll').mockRejectedValue({
      response: { status: 403, data: { error: 'Forbidden' } },
    });

    try {
      await updateAllPreviousRunLinks(courseId)(dispatch, getState);
    } catch (error) {
      // Expected to throw
    }

    expect(dispatch).toHaveBeenCalledWith({
      payload: { status: RequestStatus.FAILED },
      type: 'courseOptimizer/updateSavingStatus',
    });
  });

  it('should handle timeout errors', async () => {
    jest.spyOn(api, 'postRerunLinkUpdateAll').mockRejectedValue(new Error('timeout'));

    try {
      await updateAllPreviousRunLinks(courseId)(dispatch, getState);
    } catch (error) {
      // Expected to throw
    }

    expect(dispatch).toHaveBeenCalledWith({
      payload: { status: RequestStatus.FAILED },
      type: 'courseOptimizer/updateSavingStatus',
    });
  });
});

describe('updateSinglePreviousRunLink additional edge cases', () => {
  const dispatch = jest.fn();
  const getState = jest.fn();
  const courseId = 'course-123';
  const linkUrl = 'https://old.example.com/link';
  const blockId = 'block-id-123';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should use default contentType when not provided', async () => {
    const mockPostRerunLinkUpdateSingle = jest.spyOn(api, 'postRerunLinkUpdateSingle').mockResolvedValue({
      success: true,
    });

    await updateSinglePreviousRunLink(courseId, linkUrl, blockId)(dispatch, getState);

    expect(mockPostRerunLinkUpdateSingle).toHaveBeenCalledWith(courseId, linkUrl, blockId, 'course_updates');
  });

  it('should handle HTTP 400 errors', async () => {
    jest.spyOn(api, 'postRerunLinkUpdateSingle').mockRejectedValue({
      response: { status: 400, data: { error: 'Bad Request' } },
    });

    try {
      await updateSinglePreviousRunLink(courseId, linkUrl, blockId, 'sections')(dispatch, getState);
    } catch (error) {
      // Expected to throw
    }

    expect(dispatch).toHaveBeenCalledWith({
      payload: { status: RequestStatus.FAILED },
      type: 'courseOptimizer/updateSavingStatus',
    });
  });

  it('should handle malformed URLs gracefully', async () => {
    const malformedUrl = 'not-a-valid-url';
    jest.spyOn(api, 'postRerunLinkUpdateSingle').mockRejectedValue(new Error('Invalid URL'));

    try {
      await updateSinglePreviousRunLink(courseId, malformedUrl, blockId, 'sections')(dispatch, getState);
    } catch (error) {
      // Expected to throw
    }

    expect(dispatch).toHaveBeenCalledWith({
      payload: { status: RequestStatus.FAILED },
      type: 'courseOptimizer/updateSavingStatus',
    });
  });
});

describe('updateAllPreviousRunLinks with polling support', () => {
  const dispatch = jest.fn();
  const getState = jest.fn();
  const courseId = 'course-123';
  let mockPostRerunLinkUpdateAll;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPostRerunLinkUpdateAll = jest.spyOn(api, 'postRerunLinkUpdateAll').mockResolvedValue({
      success: true,
    });
  });

  describe('successful request', () => {
    it('should dispatch rerun link update in progress actions', async () => {
      await updateAllPreviousRunLinks(courseId)(dispatch, getState);

      expect(dispatch).toHaveBeenCalledWith({
        payload: { status: RequestStatus.PENDING },
        type: 'courseOptimizer/updateSavingStatus',
      });

      expect(dispatch).toHaveBeenCalledWith({
        payload: true,
        type: 'courseOptimizer/updateRerunLinkUpdateInProgress',
      });

      expect(dispatch).toHaveBeenCalledWith({
        payload: { status: RequestStatus.SUCCESSFUL },
        type: 'courseOptimizer/updateSavingStatus',
      });

      expect(mockPostRerunLinkUpdateAll).toHaveBeenCalledWith(courseId);
    });
  });

  describe('failed request', () => {
    it('should set rerun link update in progress to false on failure', async () => {
      mockPostRerunLinkUpdateAll.mockRejectedValue(new Error('API error'));

      try {
        await updateAllPreviousRunLinks(courseId)(dispatch, getState);
      } catch (error) {
        // Expected to throw
      }

      expect(dispatch).toHaveBeenCalledWith({
        payload: true,
        type: 'courseOptimizer/updateRerunLinkUpdateInProgress',
      });

      expect(dispatch).toHaveBeenCalledWith({
        payload: false,
        type: 'courseOptimizer/updateRerunLinkUpdateInProgress',
      });

      expect(dispatch).toHaveBeenCalledWith({
        payload: { status: RequestStatus.FAILED },
        type: 'courseOptimizer/updateSavingStatus',
      });
    });
  });
});

describe('fetchRerunLinkUpdateStatus with polling support', () => {
  const dispatch = jest.fn();
  const getState = jest.fn();
  const courseId = 'course-123';
  let mockGetRerunLinkUpdateStatus;

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetRerunLinkUpdateStatus = jest.spyOn(api, 'getRerunLinkUpdateStatus');
  });

  describe('successful request with in-progress status', () => {
    it('should set rerun link update in progress to true', async () => {
      mockGetRerunLinkUpdateStatus.mockResolvedValue({
        status: 'In Progress',
        updateStatus: 'Pending',
      });

      const result = await fetchRerunLinkUpdateStatus(courseId)(dispatch, getState);

      expect(dispatch).toHaveBeenCalledWith({
        payload: true,
        type: 'courseOptimizer/updateRerunLinkUpdateInProgress',
      });

      expect(result.status).toBe('In Progress');
    });
  });

  describe('successful request with succeeded status', () => {
    it('should set rerun link update in progress to false', async () => {
      mockGetRerunLinkUpdateStatus.mockResolvedValue({
        status: 'Succeeded',
        updateStatus: 'Succeeded',
        results: [],
      });

      const result = await fetchRerunLinkUpdateStatus(courseId)(dispatch, getState);

      expect(dispatch).toHaveBeenCalledWith({
        payload: false,
        type: 'courseOptimizer/updateRerunLinkUpdateInProgress',
      });

      expect(result.status).toBe('Succeeded');
    });
  });

  describe('successful request with failed status', () => {
    it('should set rerun link update in progress to false', async () => {
      mockGetRerunLinkUpdateStatus.mockResolvedValue({
        status: 'Failed',
        updateStatus: 'Failed',
        results: [],
      });

      const result = await fetchRerunLinkUpdateStatus(courseId)(dispatch, getState);

      expect(dispatch).toHaveBeenCalledWith({
        payload: false,
        type: 'courseOptimizer/updateRerunLinkUpdateInProgress',
      });

      expect(result.status).toBe('Failed');
    });
  });

  describe('failed request', () => {
    it('should set rerun link update in progress to false on error', async () => {
      mockGetRerunLinkUpdateStatus.mockRejectedValue(new Error('API error'));

      try {
        await fetchRerunLinkUpdateStatus(courseId)(dispatch, getState);
      } catch (error) {
        // Expected to throw
      }

      expect(dispatch).toHaveBeenCalledWith({
        payload: false,
        type: 'courseOptimizer/updateRerunLinkUpdateInProgress',
      });
    });
  });
});
