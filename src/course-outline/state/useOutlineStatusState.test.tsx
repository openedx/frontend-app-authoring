import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RequestStatus } from '@src/data/constants';
import { useOutlineStatusState } from './useOutlineStatusState';

const mockCreateDiscussionsTopics = jest.fn();
const mockGetCourseOutlineStatusBarData = jest.fn();
const mockUseCourseOutlineIndex = jest.fn();
const mockUseCourseBestPractices = jest.fn();
const mockUseCourseLaunch = jest.fn();

jest.mock('../data/api', () => ({
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

jest.mock('../data/apiHooks', () => {
  const actual = jest.requireActual('../data/apiHooks');
  return {
    ...actual,
    useCourseBestPractices: (...args: any[]) => mockUseCourseBestPractices(...args),
    useCourseLaunch: (...args: any[]) => mockUseCourseLaunch(...args),
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
  };
}

const testQueryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

function renderStatusHook(input?: Partial<ReturnType<typeof defaultInput>>) {
  const merged = { ...defaultInput(), ...input };
  return renderHook(() => useOutlineStatusState(merged), {
    wrapper: ({ children }) => (
      <QueryClientProvider client={testQueryClient}>
        {children}
      </QueryClientProvider>
    ),
  });
}

describe('useOutlineStatusState', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateDiscussionsTopics.mockResolvedValue([]);
    mockGetCourseOutlineStatusBarData.mockReturnValue({
      courseReleaseDate: '2025-06-01',
      highlightsEnabledForMessaging: false,
      videoSharingOptions: 'per_course',
    });
    // Default: both queries succeed with data
    mockUseCourseBestPractices.mockReturnValue({
      data: { some: 'data' },
      isPending: false,
      isError: false,
      isSuccess: true,
      error: undefined,
    });
    mockUseCourseLaunch.mockReturnValue({
      data: { isSelfPaced: false },
      isPending: false,
      isError: false,
      isSuccess: true,
      error: undefined,
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
      mockUseCourseLaunch.mockReturnValue({
        data: undefined,
        isPending: true,
        isError: false,
        isSuccess: false,
        error: undefined,
      });

      const { result } = renderStatusHook();

      expect(result.current.effectiveLoadingStatus.outlineIndexIsLoading).toBe(true);
      expect(result.current.effectiveLoadingStatus.outlineIndexIsDenied).toBe(false);
      expect(result.current.effectiveLoadingStatus.courseLaunchQueryStatus).toBe(RequestStatus.IN_PROGRESS);
    });

    it('maps 403 error to DENIED status with null error', () => {
      mockUseCourseOutlineIndex.mockReturnValue({
        data: undefined,
        isPending: false,
        isSuccess: false,
        error: { response: { status: 403 } },
      });

      const { result } = renderStatusHook();

      expect(result.current.effectiveLoadingStatus.outlineIndexIsLoading).toBe(false);
      expect(result.current.effectiveLoadingStatus.outlineIndexIsDenied).toBe(true);
      expect(result.current.rawErrors.outlineIndexApi).toBeNull();
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
      expect(result.current.rawErrors.outlineIndexApi).toEqual(
        expect.objectContaining({ type: 'serverError' }),
      );
    });
  });

  describe('status bar merge behavior', () => {
    it('merges base status bar with checklist and self-paced from query hooks', () => {
      mockUseCourseOutlineIndex.mockReturnValue({
        data: sampleOutlineIndexData,
        isPending: false,
        isSuccess: true,
        error: undefined,
      });

      const { result } = renderStatusHook();

      // Checklist values are synchronously available from query data
      expect(result.current.statusBarData.checklist.totalCourseBestPracticesChecks).toBe(5);
      expect(result.current.statusBarData.courseReleaseDate).toBe('2025-06-01');
      expect(result.current.statusBarData.highlightsEnabledForMessaging).toBe(false);
      expect(result.current.statusBarData.videoSharingOptions).toBe('per_course');
      expect(result.current.statusBarData.checklist).toEqual({
        totalCourseLaunchChecks: 8,
        completedCourseLaunchChecks: 4,
        totalCourseBestPracticesChecks: 5,
        completedCourseBestPracticesChecks: 3,
      });
      expect(result.current.statusBarData.isSelfPaced).toBe(false);
    });
  });

  describe('checklist/launch state from query hooks', () => {
    it('sets courseLaunchQueryStatus SUCCESSFUL and merges checklist on success', () => {
      mockUseCourseOutlineIndex.mockReturnValue({
        data: sampleOutlineIndexData,
        isPending: false,
        isSuccess: true,
        error: undefined,
      });
      mockUseCourseLaunch.mockReturnValue({
        data: { isSelfPaced: true },
        isPending: false,
        isError: false,
        isSuccess: true,
        error: undefined,
      });

      const { result } = renderStatusHook();

      expect(result.current.effectiveLoadingStatus.courseLaunchQueryStatus).toBe(RequestStatus.SUCCESSFUL);
      expect(result.current.statusBarData.checklist).toEqual({
        totalCourseLaunchChecks: 8,
        completedCourseLaunchChecks: 4,
        totalCourseBestPracticesChecks: 5,
        completedCourseBestPracticesChecks: 3,
      });
      expect(result.current.statusBarData.isSelfPaced).toBe(true);
    });

    it('sets courseLaunchQueryStatus FAILED and error on launch failure', () => {
      mockUseCourseOutlineIndex.mockReturnValue({
        data: sampleOutlineIndexData,
        isPending: false,
        isSuccess: true,
        error: undefined,
      });
      mockUseCourseLaunch.mockReturnValue({
        data: undefined,
        isPending: false,
        isError: true,
        isSuccess: false,
        error: new Error('launch fetch failed'),
      });

      const { result } = renderStatusHook();

      expect(result.current.effectiveLoadingStatus.courseLaunchQueryStatus).toBe(RequestStatus.FAILED);
      expect(result.current.rawErrors.courseLaunchApi).toEqual(
        expect.objectContaining({ type: 'serverError' }),
      );
    });
  });

  describe('discussion topics sync', () => {
    it('calls createDiscussionsTopics for recent course and logs error on failure', async () => {
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

      mockCreateDiscussionsTopics.mockRejectedValue(new Error('discussion sync failed'));

      renderStatusHook();

      // The createDiscussionsTopics effect is called asynchronously
      await new Promise(process.nextTick);

      expect(mockCreateDiscussionsTopics).toHaveBeenCalled();
      expect(mockLogError).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'discussion sync failed' }),
      );
    });

    it('does not call createDiscussionsTopics for old course', () => {
      mockUseCourseOutlineIndex.mockReturnValue({
        data: sampleOutlineIndexData,
        isPending: false,
        isSuccess: true,
        error: undefined,
      });

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
