import { setConfig, getConfig } from '@edx/frontend-platform';
import { RequestStatus } from '@src/data/constants';
import { act, renderHook, waitFor, initializeMocks, makeWrapper } from '@src/testUtils';
import { courseOutlineIndexQueryKey } from './outlineIndexQuery';

// --- Mock API layer ---
const mockSetVideoSharingOption = jest.fn();
const mockEnableCourseHighlightsEmails = jest.fn();
const mockDismissNotification = jest.fn();
const mockRestartIndexingOnCourse = jest.fn();
const mockDeleteCourseItem = jest.fn();

jest.mock('./api', () => ({
  setVideoSharingOption: (...args: any[]) => mockSetVideoSharingOption(...args),
  enableCourseHighlightsEmails: (...args: any[]) => mockEnableCourseHighlightsEmails(...args),
  dismissNotification: (...args: any[]) => mockDismissNotification(...args),
  restartIndexingOnCourse: (...args: any[]) => mockRestartIndexingOnCourse(...args),
  deleteCourseItem: (...args: any[]) => mockDeleteCourseItem(...args),
}));

// Hooks-under-test — must import after jest.mock
import {
  useSetVideoSharingOption,
  useEnableCourseHighlightsEmails,
  useDismissNotification,
  useRestartIndexingOnCourse,
  useCourseOutlineSavingStatus,
  useCourseOutlineReindexStatus,
  useDeleteCourseItem,
} from './apiHooks';

const courseId = 'course-v1:edX+DemoX+Demo_Course';
const STUDIO_BASE_URL = 'http://localhost:18010';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Minimal outline-index shape the delete optimistic update expects. */
function buildOutlineIndex(
  chapters: Array<{ id: string; displayName: string; subs?: Array<{ id: string; displayName: string; units?: Array<{ id: string; displayName: string }> }> }>,
) {
  return {
    courseStructure: {
      childInfo: {
        children: chapters.map((ch) => ({
          id: ch.id,
          displayName: ch.displayName,
          category: 'chapter',
          childInfo: {
            children: (ch.subs || []).map((sub) => ({
              id: sub.id,
              displayName: sub.displayName,
              category: 'sequential',
              childInfo: {
                children: (sub.units || []).map((u) => ({
                  id: u.id,
                  displayName: u.displayName,
                  category: 'vertical',
                })),
              },
            })),
          },
        })),
      },
    },
  };
}

// ---------------------------------------------------------------------------
// useSetVideoSharingOption
// ---------------------------------------------------------------------------
describe('useSetVideoSharingOption', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    initializeMocks();
  });

  it('calls setVideoSharingOption with courseId and value', async () => {
    mockSetVideoSharingOption.mockResolvedValue({});

    const { result } = renderHook(() => useSetVideoSharingOption(courseId), { wrapper: makeWrapper() });

    await act(async () => {
      await result.current.mutateAsync('per-video');
    });

    expect(mockSetVideoSharingOption).toHaveBeenCalledWith(courseId, 'per-video');
  });

  it('updates outline-index cache with video sharing option on success', async () => {
    const { queryClient } = initializeMocks();
    mockSetVideoSharingOption.mockResolvedValue({});

    // Prime cache with initial data
    queryClient.setQueryData(courseOutlineIndexQueryKey(courseId), {
      courseStructure: { childInfo: { children: [] } },
      statusBar: { videoSharingOptions: 'per-video' },
    });

    const { result } = renderHook(() => useSetVideoSharingOption(courseId), { wrapper: makeWrapper() });

    await act(async () => {
      await result.current.mutateAsync('individual');
    });

    await waitFor(() => {
      const data = queryClient.getQueryData(courseOutlineIndexQueryKey(courseId)) as any;
      expect(data.statusBar.videoSharingOptions).toBe('individual');
    });
  });

  it('invalidates outline-index query on success (triggers refetch)', async () => {
    const { queryClient } = initializeMocks();
    mockSetVideoSharingOption.mockResolvedValue({});

    queryClient.setQueryData(courseOutlineIndexQueryKey(courseId), {
      courseStructure: { childInfo: { children: [] } },
      statusBar: { videoSharingOptions: 'per-video' },
    });

    const { result } = renderHook(() => useSetVideoSharingOption(courseId), { wrapper: makeWrapper() });

    await act(async () => {
      await result.current.mutateAsync('per-course');
    });

    // After invalidation, the query is marked invalidated
    const state = queryClient.getQueryState(courseOutlineIndexQueryKey(courseId));
    expect(state?.isInvalidated).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// useEnableCourseHighlightsEmails
// ---------------------------------------------------------------------------
describe('useEnableCourseHighlightsEmails', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    initializeMocks();
  });

  it('calls enableCourseHighlightsEmails with courseId', async () => {
    mockEnableCourseHighlightsEmails.mockResolvedValue({});

    const { result } = renderHook(() => useEnableCourseHighlightsEmails(courseId), { wrapper: makeWrapper() });

    await act(async () => {
      await result.current.mutateAsync();
    });

    expect(mockEnableCourseHighlightsEmails).toHaveBeenCalledWith(courseId);
  });

  it('invalidates outline-index query on success', async () => {
    const { queryClient } = initializeMocks();
    mockEnableCourseHighlightsEmails.mockResolvedValue({});

    queryClient.setQueryData(courseOutlineIndexQueryKey(courseId), {
      courseStructure: { childInfo: { children: [] } },
    });

    const { result } = renderHook(() => useEnableCourseHighlightsEmails(courseId), { wrapper: makeWrapper() });

    await act(async () => {
      await result.current.mutateAsync();
    });

    const state = queryClient.getQueryState(courseOutlineIndexQueryKey(courseId));
    expect(state?.isInvalidated).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// useDismissNotification
// ---------------------------------------------------------------------------
describe('useDismissNotification', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    initializeMocks();
  });

  it('calls dismissNotification with full URL built from config base and dismissUrl', async () => {
    setConfig({ ...getConfig(), STUDIO_BASE_URL });
    mockDismissNotification.mockResolvedValue(undefined);

    const dismissUrl = '/api/user/v1/notifications/123';
    const { result } = renderHook(() => useDismissNotification(courseId), { wrapper: makeWrapper() });

    await act(async () => {
      result.current.mutate(dismissUrl);
    });

    expect(mockDismissNotification).toHaveBeenCalledWith(`${STUDIO_BASE_URL}${dismissUrl}`);
  });

  it('uses bare useMutation (no processing notification)', async () => {
    setConfig({ ...getConfig(), STUDIO_BASE_URL });
    mockDismissNotification.mockResolvedValue(undefined);

    const { result } = renderHook(() => useDismissNotification(courseId), { wrapper: makeWrapper() });

    // The hook should return a useMutation result, not a
    // useMutationWithProcessingNotification (no showToast/closeToast)
    expect(result.current).not.toHaveProperty('showToast');
    expect(typeof result.current.mutate).toBe('function');
    expect(typeof result.current.mutateAsync).toBe('function');
  });
});

// ---------------------------------------------------------------------------
// useRestartIndexingOnCourse
// ---------------------------------------------------------------------------
describe('useRestartIndexingOnCourse', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    initializeMocks();
  });

  it('calls restartIndexingOnCourse with reindexLink', async () => {
    mockRestartIndexingOnCourse.mockResolvedValue({});

    const reindexLink = '/api/contentstore/v1/reindex/course-v1:edX+DemoX+Demo_Course';
    const { result } = renderHook(() => useRestartIndexingOnCourse(courseId), { wrapper: makeWrapper() });

    await act(async () => {
      await result.current.mutateAsync(reindexLink);
    });

    expect(mockRestartIndexingOnCourse).toHaveBeenCalledWith(reindexLink);
  });

  it('uses bare useMutation (no processing notification)', () => {
    const { result } = renderHook(() => useRestartIndexingOnCourse(courseId), { wrapper: makeWrapper() });
    expect(typeof result.current.mutate).toBe('function');
    expect(typeof result.current.mutateAsync).toBe('function');
  });

  it('uses bare useMutation and no showToast property', () => {
    const { result } = renderHook(() => useRestartIndexingOnCourse(courseId), { wrapper: makeWrapper() });
    expect(typeof result.current.mutate).toBe('function');
    expect(typeof result.current.mutateAsync).toBe('function');
    // Verify no showToast/closeToast (bare mutation, not wrapped)
    expect(result.current).not.toHaveProperty('showToast');
  });
});

// ---------------------------------------------------------------------------
// useCourseOutlineSavingStatus
// ---------------------------------------------------------------------------
describe('useCourseOutlineSavingStatus', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    initializeMocks();
  });

  it('returns empty string when no mutations exist (idle)', () => {
    const { result } = renderHook(() => useCourseOutlineSavingStatus(courseId), { wrapper: makeWrapper() });
    expect(result.current).toBe('');
  });

  it('returns PENDING when any mutation is pending (pending wins)', async () => {
    // Arrange: trigger a mutation and keep it pending by returning an unresolved promise
    let resolvePending!: (value: unknown) => void;
    mockSetVideoSharingOption.mockReturnValue(new Promise((resolve) => { resolvePending = resolve; }));

    const { result: mutResult } = renderHook(() => useSetVideoSharingOption(courseId), { wrapper: makeWrapper() });

    act(() => {
      mutResult.current.mutate('per-video');
    });

    // The mutation should now be pending; status hook should see it
    const { result: statusResult } = renderHook(() => useCourseOutlineSavingStatus(courseId), { wrapper: makeWrapper() });

    await waitFor(() => {
      expect(statusResult.current).toBe(RequestStatus.PENDING);
    });

    // Clean up: resolve the pending mutation so it doesn't linger
    await act(async () => {
      resolvePending({});
    });
  });

  it('returns SUCCESSFUL when latest completed mutation succeeded', async () => {
    mockSetVideoSharingOption.mockResolvedValue({});

    const { result: mutResult } = renderHook(() => useSetVideoSharingOption(courseId), { wrapper: makeWrapper() });

    await act(async () => {
      await mutResult.current.mutateAsync('per-video');
    });

    const { result: statusResult } = renderHook(() => useCourseOutlineSavingStatus(courseId), { wrapper: makeWrapper() });

    await waitFor(() => {
      expect(statusResult.current).toBe(RequestStatus.SUCCESSFUL);
    });
  });

  it('returns FAILED when latest completed mutation errored', async () => {
    // Render the status hook first so it subscribes immediately
    const { result: statusResult } = renderHook(
      () => useCourseOutlineSavingStatus(courseId),
      { wrapper: makeWrapper() },
    );

    // Now trigger a failing mutation
    mockSetVideoSharingOption.mockRejectedValue(new Error('failure'));
    const { result: mutResult } = renderHook(
      () => useSetVideoSharingOption(courseId),
      { wrapper: makeWrapper() },
    );

    // Use mutate (not mutateAsync) so we don't need to catch rejection
    act(() => {
      mutResult.current.mutate('per-course');
    });

    await waitFor(() => {
      expect(statusResult.current).toBe(RequestStatus.FAILED);
    });
  });

  it('uses latest completed mutation by submittedAt (error after success → FAILED)', async () => {
    mockEnableCourseHighlightsEmails.mockResolvedValueOnce({});
    mockEnableCourseHighlightsEmails.mockRejectedValueOnce(new Error('fail-later'));

    // Hook A uses key suffix 'highlightsEmail' — still matches saving(courseId)
    const { result: mutResult } = renderHook(
      () => useEnableCourseHighlightsEmails(courseId),
      { wrapper: makeWrapper() },
    );

    // First mutation: success
    await act(async () => {
      await mutResult.current.mutateAsync();
    });

    // Small delay to ensure submittedAt ordering
    await new Promise((r) => { setTimeout(r, 5); });

    // Second mutation: error
    await act(async () => {
      try { await mutResult.current.mutateAsync(); } catch { /* expected */ }
    });

    const { result: statusResult } = renderHook(
      () => useCourseOutlineSavingStatus(courseId),
      { wrapper: makeWrapper() },
    );

    await waitFor(() => {
      // Latest completed is the error → FAILED
      expect(statusResult.current).toBe(RequestStatus.FAILED);
    });
  });

  it('pending wins over completed mutations (even if later completed exists)', async () => {
    // First mutation: succeeds immediately
    mockEnableCourseHighlightsEmails.mockResolvedValueOnce({});
    // Second mutation: stays pending
    let resolveSecond!: (value: unknown) => void;
    mockSetVideoSharingOption.mockReturnValueOnce(
      new Promise((resolve) => { resolveSecond = resolve; }),
    );

    // Trigger a completed success mutation first
    const { result: mut1 } = renderHook(
      () => useEnableCourseHighlightsEmails(courseId),
      { wrapper: makeWrapper() },
    );
    await act(async () => {
      await mut1.current.mutateAsync();
    });

    // Now trigger a pending mutation
    const { result: mut2 } = renderHook(
      () => useSetVideoSharingOption(courseId),
      { wrapper: makeWrapper() },
    );
    act(() => {
      mut2.current.mutate('per-video');
    });

    // Even though the first mutation completed as success,
    // the pending second mutation should make status PENDING
    const { result: statusResult } = renderHook(
      () => useCourseOutlineSavingStatus(courseId),
      { wrapper: makeWrapper() },
    );

    await waitFor(() => {
      expect(statusResult.current).toBe(RequestStatus.PENDING);
    });

    // Clean up
    await act(async () => {
      resolveSecond({});
    });
  });
});

// ---------------------------------------------------------------------------
// useCourseOutlineReindexStatus
// ---------------------------------------------------------------------------
describe('useCourseOutlineReindexStatus', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    initializeMocks();
  });

  it('returns IN_PROGRESS when no reindex mutations exist (idle)', () => {
    const { result } = renderHook(() => useCourseOutlineReindexStatus(courseId), { wrapper: makeWrapper() });

    expect(result.current).toEqual({
      reindexLoadingStatus: RequestStatus.IN_PROGRESS,
      reindexError: null,
    });
  });

  it('returns IN_PROGRESS when reindex mutation is pending', async () => {
    let resolveReindex!: (value: unknown) => void;
    mockRestartIndexingOnCourse.mockReturnValue(
      new Promise((resolve) => { resolveReindex = resolve; }),
    );

    const { result: mutResult } = renderHook(
      () => useRestartIndexingOnCourse(courseId),
      { wrapper: makeWrapper() },
    );

    act(() => {
      mutResult.current.mutate('/some/link');
    });

    const { result: statusResult } = renderHook(
      () => useCourseOutlineReindexStatus(courseId),
      { wrapper: makeWrapper() },
    );

    await waitFor(() => {
      expect(statusResult.current).toEqual({
        reindexLoadingStatus: RequestStatus.IN_PROGRESS,
        reindexError: null,
      });
    });

    await act(async () => { resolveReindex({}); });
  });

  it('returns SUCCESSFUL when reindex mutation succeeds', async () => {
    mockRestartIndexingOnCourse.mockResolvedValue({});

    const { result: mutResult } = renderHook(
      () => useRestartIndexingOnCourse(courseId),
      { wrapper: makeWrapper() },
    );

    await act(async () => {
      await mutResult.current.mutateAsync('/some/link');
    });

    const { result: statusResult } = renderHook(
      () => useCourseOutlineReindexStatus(courseId),
      { wrapper: makeWrapper() },
    );

    await waitFor(() => {
      expect(statusResult.current).toEqual({
        reindexLoadingStatus: RequestStatus.SUCCESSFUL,
        reindexError: null,
      });
    });
  });

  it('returns FAILED with error details when reindex mutation errors', async () => {
    // Mock getErrorDetails internally by passing an error with 'response' shape
    const apiError = { response: { status: 500, data: 'reindex failed' } };
    mockRestartIndexingOnCourse.mockRejectedValue(apiError);

    const { result: statusResult } = renderHook(
      () => useCourseOutlineReindexStatus(courseId),
      { wrapper: makeWrapper() },
    );

    const { result: mutResult } = renderHook(
      () => useRestartIndexingOnCourse(courseId),
      { wrapper: makeWrapper() },
    );

    act(() => {
      mutResult.current.mutate('/some/link');
    });

    await waitFor(() => {
      expect(statusResult.current.reindexLoadingStatus).toBe(RequestStatus.FAILED);
      expect(statusResult.current.reindexError).toEqual(
        expect.objectContaining({ type: 'serverError' }),
      );
    });
  });
});

// ---------------------------------------------------------------------------
// useDeleteCourseItem — optimistic outline-index cache update
// ---------------------------------------------------------------------------
describe('useDeleteCourseItem optimistic cache update', () => {
  const chapterId = 'block-v1:edX+DemoX+Demo_Course+type@chapter+block@ch1';
  const chapter2Id = 'block-v1:edX+DemoX+Demo_Course+type@chapter+block@ch2';
  const seqId = 'block-v1:edX+DemoX+Demo_Course+type@sequential+block@seq1';
  const seq2Id = 'block-v1:edX+DemoX+Demo_Course+type@sequential+block@seq2';
  const unitId = 'block-v1:edX+DemoX+Demo_Course+type@vertical+block@unit1';
  const unit2Id = 'block-v1:edX+DemoX+Demo_Course+type@vertical+block@unit2';

  beforeEach(() => {
    jest.clearAllMocks();
    initializeMocks();
    mockDeleteCourseItem.mockResolvedValue({});
  });

  it('removes chapter from outline-index children on chapter delete', async () => {
    const { queryClient } = initializeMocks();

    const outlineData = buildOutlineIndex([
      { id: chapterId, displayName: 'Chapter 1' },
      { id: chapter2Id, displayName: 'Chapter 2' },
    ]);
    queryClient.setQueryData(courseOutlineIndexQueryKey(courseId), outlineData);

    const { result } = renderHook(() => useDeleteCourseItem(courseId), { wrapper: makeWrapper() });

    await act(async () => {
      await result.current.mutateAsync({ itemId: chapterId, sectionId: chapterId });
    });

    const updated = queryClient.getQueryData(courseOutlineIndexQueryKey(courseId)) as any;
    expect(updated.courseStructure.childInfo.children).toHaveLength(1);
    expect(updated.courseStructure.childInfo.children[0].id).toBe(chapter2Id);
  });

  it('removes sequential from its parent section children on sequential delete', async () => {
    const { queryClient } = initializeMocks();

    const outlineData = buildOutlineIndex([
      {
        id: chapterId, displayName: 'Ch 1',
        subs: [
          { id: seqId, displayName: 'Seq 1' },
          { id: seq2Id, displayName: 'Seq 2' },
        ],
      },
    ]);
    queryClient.setQueryData(courseOutlineIndexQueryKey(courseId), outlineData);

    const { result } = renderHook(() => useDeleteCourseItem(courseId), { wrapper: makeWrapper() });

    await act(async () => {
      await result.current.mutateAsync({ itemId: seqId, sectionId: chapterId });
    });

    const updated = queryClient.getQueryData(courseOutlineIndexQueryKey(courseId)) as any;
    const section = updated.courseStructure.childInfo.children[0];
    expect(section.childInfo.children).toHaveLength(1);
    expect(section.childInfo.children[0].id).toBe(seq2Id);
  });

  it('removes unit from its parent subsection children on vertical delete', async () => {
    const { queryClient } = initializeMocks();

    const outlineData = buildOutlineIndex([
      {
        id: chapterId, displayName: 'Ch 1',
        subs: [
          {
            id: seqId, displayName: 'Seq 1',
            units: [
              { id: unitId, displayName: 'Unit 1' },
              { id: unit2Id, displayName: 'Unit 2' },
            ],
          },
        ],
      },
    ]);
    queryClient.setQueryData(courseOutlineIndexQueryKey(courseId), outlineData);

    const { result } = renderHook(() => useDeleteCourseItem(courseId), { wrapper: makeWrapper() });

    await act(async () => {
      await result.current.mutateAsync({ itemId: unitId, sectionId: chapterId, subsectionId: seqId });
    });

    const updated = queryClient.getQueryData(courseOutlineIndexQueryKey(courseId)) as any;
    const subsection = updated.courseStructure.childInfo.children[0].childInfo.children[0];
    expect(subsection.childInfo.children).toHaveLength(1);
    expect(subsection.childInfo.children[0].id).toBe(unit2Id);
  });

  it('does not modify cache for non-matching category (e.g. "course")', async () => {
    const { queryClient } = initializeMocks();

    const outlineData = buildOutlineIndex([
      { id: chapterId, displayName: 'Ch 1', subs: [{ id: seqId, displayName: 'Seq 1' }] },
    ]);
    queryClient.setQueryData(courseOutlineIndexQueryKey(courseId), outlineData);
    const before = queryClient.getQueryData(courseOutlineIndexQueryKey(courseId));

    const courseBlockId = 'block-v1:edX+DemoX+Demo_Course+type@course+block@course';
    const { result } = renderHook(() => useDeleteCourseItem(courseId), { wrapper: makeWrapper() });

    await act(async () => {
      await result.current.mutateAsync({ itemId: courseBlockId, sectionId: courseBlockId });
    });

    const after = queryClient.getQueryData(courseOutlineIndexQueryKey(courseId));
    expect(after).toEqual(before);
  });

  it('does not throw when outline-index cache is empty', async () => {
    const { queryClient } = initializeMocks();
    // No cache set — should be undefined
    expect(queryClient.getQueryData(courseOutlineIndexQueryKey(courseId))).toBeUndefined();

    const { result } = renderHook(() => useDeleteCourseItem(courseId), { wrapper: makeWrapper() });

    await expect(
      act(async () => {
        await result.current.mutateAsync({ itemId: unitId, sectionId: chapterId, subsectionId: seqId });
      }),
    ).resolves.not.toThrow();
  });
});
