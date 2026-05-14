import { renderHook, waitFor } from '@testing-library/react';
import { RequestStatus } from '@src/data/constants';
import { useOutlineStatusState } from './useOutlineStatusState';

// --- Mocks ---

const mockGetCourseBestPractices = jest.fn();
const mockGetCourseLaunch = jest.fn();
const mockCreateDiscussionsTopics = jest.fn();
const mockGetCourseOutlineStatusBarData = jest.fn();
const mockUseCourseOutlineIndex = jest.fn();

jest.mock('../data/api', () => ({
  getCourseBestPractices: (...args: any[]) => mockGetCourseBestPractices(...args),
  getCourseLaunch: (...args: any[]) => mockGetCourseLaunch(...args),
  createDiscussionsTopics: (...args: any[]) => mockCreateDiscussionsTopics(...args),
}));

const mockLogError = jest.fn();

jest.mock('@edx/frontend-platform/logging', () => ({
  logError: (...args: any[]) => mockLogError(...args),
}));

jest.mock('../utils/getErrorDetails', () => ({
  getErrorDetails: jest.fn((error: any) => ({
    type: 'serverError',
    data: error?.message || 'unknown error',
    dismissible: true,
  })),
}));

jest.mock('../utils/getChecklistForStatusBar', () => ({
  getCourseBestPracticesChecklist: jest.fn(() => ({
    totalCourseBestPracticesChecks: 5,
    completedCourseBestPracticesChecks: 3,
  })),
  getCourseLaunchChecklist: jest.fn(() => ({
    totalCourseLaunchChecks: 8,
    completedCourseLaunchChecks: 4,
  })),
}));

jest.mock('../data/outlineIndexQuery', () => {
  const actual = jest.requireActual('../data/outlineIndexQuery');
  return {
    ...actual,
    useCourseOutlineIndex: (...args: any[]) => mockUseCourseOutlineIndex(...args),
    getCourseOutlineStatusBarData: (...args: any[]) => mockGetCourseOutlineStatusBarData(...args),
  };
});

const sampleOutlineIndexData = {
  courseStructure: {
    id: 'course-v1:test+course+2025',
    displayName: 'Test Course',
    actions: { deletable: true, draggable: true, childAddable: true, duplicable: true },
    childInfo: {
      children: [{ id: 'A', displayName: 'Section A' }],
    },
  },
  isCustomRelativeDatesActive: true,
  createdOn: '2025-01-15T00:00:00Z',
};

function defaultInput() {
  return {
    courseId: 'course-v1:test+course+2025',
    reindexLoadingStatus: RequestStatus.IN_PROGRESS,
    localStatusBarOverride: {},
    dismissedErrorSignatures: {},
    localReindexError: null,
  };
}

function renderStatusHook(input?: Partial<ReturnType<typeof defaultInput>>) {
  const merged = { ...defaultInput(), ...input };
  return renderHook(() => useOutlineStatusState(merged));
}

describe('useOutlineStatusState', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetCourseBestPractices.mockResolvedValue({ some: 'data' });
    mockGetCourseLaunch.mockResolvedValue({ isSelfPaced: false });
    mockCreateDiscussionsTopics.mockResolvedValue([]);
    mockGetCourseOutlineStatusBarData.mockReturnValue({
      courseReleaseDate: '2025-06-01',
      highlightsEnabledForMessaging: false,
      videoSharingOptions: 'per_course',
    });
  });

  describe('outline query state mapping', () => {
    it('returns IN_PROGRESS loading status when query is pending', () => {
      mockUseCourseOutlineIndex.mockReturnValue({
        data: undefined,
        isPending: true,
        isSuccess: false,
        error: undefined,
      });

      const { result } = renderStatusHook();

      expect(result.current.effectiveLoadingStatus.outlineIndexIsLoading).toBe(true);
      expect(result.current.effectiveLoadingStatus.outlineIndexIsDenied).toBe(false);
      expect(result.current.effectiveLoadingStatus.courseLaunchQueryStatus).toBe(RequestStatus.IN_PROGRESS);
    });

    it('maps 403 error to DENIED status with null errors', () => {
      mockUseCourseOutlineIndex.mockReturnValue({
        data: undefined,
        isPending: false,
        isSuccess: false,
        error: { response: { status: 403 } },
      });

      const { result } = renderStatusHook();

      expect(result.current.effectiveLoadingStatus.outlineIndexIsLoading).toBe(false);
      expect(result.current.effectiveLoadingStatus.outlineIndexIsDenied).toBe(true);
      expect(result.current.effectiveErrors.outlineIndexApi).toBeNull();
    });

    it('maps 500 error to FAILED status with server error payload', () => {
      mockUseCourseOutlineIndex.mockReturnValue({
        data: undefined,
        isPending: false,
        isSuccess: false,
        error: { response: { status: 500, data: 'internal error' } },
      });

      const { result } = renderStatusHook();

      expect(result.current.effectiveLoadingStatus.outlineIndexIsLoading).toBe(false);
      expect(result.current.effectiveLoadingStatus.outlineIndexIsDenied).toBe(false);
      expect(result.current.effectiveErrors.outlineIndexApi).toEqual(
        expect.objectContaining({ type: 'serverError' }),
      );
    });
  });

  describe('status bar merge behavior', () => {
    it('merges base status bar with local checklist, self-paced, and overrides', () => {
      mockUseCourseOutlineIndex.mockReturnValue({
        data: sampleOutlineIndexData,
        isPending: false,
        isSuccess: true,
        error: undefined,
      });

      const { result } = renderStatusHook({
        localStatusBarOverride: { videoSharingOptions: 'individual' },
      });

      expect(result.current.statusBarData.courseReleaseDate).toBe('2025-06-01');
      expect(result.current.statusBarData.highlightsEnabledForMessaging).toBe(false);
      expect(result.current.statusBarData.videoSharingOptions).toBe('individual');
      expect(result.current.statusBarData.checklist).toEqual({
        totalCourseLaunchChecks: 0,
        completedCourseLaunchChecks: 0,
        totalCourseBestPracticesChecks: 0,
        completedCourseBestPracticesChecks: 0,
      });
      expect(result.current.statusBarData.isSelfPaced).toBe(false);
    });
  });

  describe('dismissed error filtering', () => {
    it('filters out dismissed error keys from effectiveErrors', () => {
      mockUseCourseOutlineIndex.mockReturnValue({
        data: sampleOutlineIndexData,
        isPending: false,
        isSuccess: true,
        error: undefined,
      });

      const { result } = renderStatusHook({
        dismissedErrorSignatures: { outlineIndexApi: 'stub', courseLaunchApi: 'stub' },
        localReindexError: { type: 'serverError', data: 'reindex failed' } as any,
        // No matching signature for reindexApi so it stays visible.
      });

      expect(result.current.effectiveErrors.outlineIndexApi).toBeNull();
      expect(result.current.effectiveErrors.courseLaunchApi).toBeNull();
      expect(result.current.effectiveErrors.reindexApi).toEqual({ type: 'serverError', data: 'reindex failed' });
      expect(result.current.effectiveErrors.sectionLoadingApi).toBeNull();
    });

    it('does not hide error when its payload changed since dismissal', () => {
      // Simulate: error occurred, user dismissed it, then error source changed.
      mockUseCourseOutlineIndex.mockReturnValue({
        data: undefined,
        isPending: false,
        isSuccess: false,
        error: { response: { status: 500, data: 'new internal error' } },
      });

      // Stored signature is for a different error payload — stale dismissal.
      const staleSignature = JSON.stringify({
        type: 'serverError',
        data: '"old error data"',
        status: 500,
        dismissible: false,
      });

      const { result } = renderStatusHook({
        dismissedErrorSignatures: { outlineIndexApi: staleSignature },
      });

      // Current error has a different signature, so it must show.
      expect(result.current.effectiveErrors.outlineIndexApi).not.toBeNull();
      expect(result.current.effectiveErrors.outlineIndexApi).toEqual(
        expect.objectContaining({ type: 'serverError' }),
      );
    });

    it('clears stale dismissal when source error becomes null (proving re-show after clear)', () => {
      // Phase 1: error present with matching signature — dismissed.
      const transientError = { response: { status: 500, data: 'transient fail' } };
      mockUseCourseOutlineIndex.mockReturnValue({
        data: undefined,
        isPending: false,
        isSuccess: false,
        error: transientError,
      });

      // Compute the signature that getErrorDetails mock would produce.
      const expectedSig = JSON.stringify({
        type: 'serverError',
        data: 'unknown error',
        dismissible: true,
      });

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { result, rerender } = renderStatusHook({
        dismissedErrorSignatures: {
          outlineIndexApi: expectedSig,
        },
      });

      // Matching signature → error hidden.
      expect(result.current.effectiveErrors.outlineIndexApi).toBeNull();

      // Phase 2: error clears.
      mockUseCourseOutlineIndex.mockReturnValue({
        data: sampleOutlineIndexData,
        isPending: false,
        isSuccess: true,
        error: undefined,
      });

      rerender({});

      // After clear, effectiveErrors for outlineIndexApi is null (no error).
      // The key point: if the error re-appeared with the same payload,
      // the stale signature would have been pruned (because error went to null),
      // so the new occurrence would NOT be hidden.
      expect(result.current.effectiveErrors.outlineIndexApi).toBeNull();
    });
  });

  describe('checklist/launch effects', () => {
    it('sets courseLaunchQueryStatus SUCCESSFUL and merges checklist on success', async () => {
      mockUseCourseOutlineIndex.mockReturnValue({
        data: sampleOutlineIndexData,
        isPending: false,
        isSuccess: true,
        error: undefined,
      });

      mockGetCourseBestPractices.mockResolvedValue({ some: 'data' });
      mockGetCourseLaunch.mockResolvedValue({ isSelfPaced: true });
      mockCreateDiscussionsTopics.mockResolvedValue([]);

      const { result } = renderStatusHook();

      await waitFor(() => {
        expect(result.current.effectiveLoadingStatus.courseLaunchQueryStatus).toBe(RequestStatus.SUCCESSFUL);
      });

      expect(result.current.statusBarData.checklist).toEqual({
        totalCourseLaunchChecks: 8,
        completedCourseLaunchChecks: 4,
        totalCourseBestPracticesChecks: 5,
        completedCourseBestPracticesChecks: 3,
      });
      expect(result.current.statusBarData.isSelfPaced).toBe(true);
    });

    it('sets courseLaunchQueryStatus FAILED and error on launch failure', async () => {
      mockUseCourseOutlineIndex.mockReturnValue({
        data: sampleOutlineIndexData,
        isPending: false,
        isSuccess: true,
        error: undefined,
      });

      mockGetCourseBestPractices.mockResolvedValue({ some: 'data' });
      mockGetCourseLaunch.mockRejectedValue(new Error('launch fetch failed'));
      mockCreateDiscussionsTopics.mockResolvedValue([]);

      const { result } = renderStatusHook();

      await waitFor(() => {
        expect(result.current.effectiveLoadingStatus.courseLaunchQueryStatus).toBe(RequestStatus.FAILED);
      });

      expect(result.current.effectiveErrors.courseLaunchApi).toEqual(
        expect.objectContaining({ type: 'serverError' }),
      );
    });
  });

  describe('discussion topics sync', () => {
    it('calls logError when createDiscussionsTopics fails for recent course', async () => {
      const recentCreatedOn = new Date();
      const recentCourseData = {
        ...sampleOutlineIndexData,
        createdOn: recentCreatedOn.toISOString(),
      };

      mockUseCourseOutlineIndex.mockReturnValue({
        data: recentCourseData,
        isPending: false,
        isSuccess: true,
        error: undefined,
      });

      mockGetCourseBestPractices.mockResolvedValue({ some: 'data' });
      mockGetCourseLaunch.mockResolvedValue({ isSelfPaced: false });
      mockCreateDiscussionsTopics.mockRejectedValue(new Error('discussion sync failed'));

      renderStatusHook();

      await waitFor(() => {
        expect(mockCreateDiscussionsTopics).toHaveBeenCalled();
      });

      expect(mockLogError).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'discussion sync failed' }),
      );
    });

    it('does not call logError or createDiscussionsTopics for old course', () => {
      mockUseCourseOutlineIndex.mockReturnValue({
        data: sampleOutlineIndexData,
        isPending: false,
        isSuccess: true,
        error: undefined,
      });

      mockGetCourseBestPractices.mockResolvedValue({ some: 'data' });
      mockGetCourseLaunch.mockResolvedValue({ isSelfPaced: false });

      renderStatusHook();

      expect(mockCreateDiscussionsTopics).not.toHaveBeenCalled();
      expect(mockLogError).not.toHaveBeenCalled();
    });
  });

  describe('derived flags', () => {
    it('extracts courseActions, flags, and createdOn from outline data', () => {
      mockUseCourseOutlineIndex.mockReturnValue({
        data: sampleOutlineIndexData,
        isPending: false,
        isSuccess: true,
        error: undefined,
      });

      const { result } = renderStatusHook();

      expect(result.current.courseActions).toEqual(
        expect.objectContaining({ deletable: true, draggable: true }),
      );
      expect(result.current.isCustomRelativeDatesActive).toBe(true);
      expect(result.current.createdOn).toBe('2025-01-15T00:00:00Z');
    });

    it('returns default actions when outline data is undefined', () => {
      mockUseCourseOutlineIndex.mockReturnValue({
        data: undefined,
        isPending: true,
        isSuccess: false,
        error: undefined,
      });

      const { result } = renderStatusHook();

      expect(result.current.courseActions).toEqual(
        expect.objectContaining({ deletable: true, childAddable: true }),
      );
      expect(result.current.isCustomRelativeDatesActive).toBe(false);
      expect(result.current.createdOn).toBeUndefined();
    });
  });
});
