import { setConfig, getConfig } from '@edx/frontend-platform';
import { RequestStatus } from '@src/data/constants';
import { act, renderHook, waitFor, initializeMocks, makeWrapper } from '@src/testUtils';
import { courseOutlineQueryKeys } from './queryKeys';
import { buildTestOutline } from '../__mocks__';

// --- Mock API layer ---
const mockSetVideoSharingOption = jest.fn();
const mockEnableCourseHighlightsEmails = jest.fn();
const mockDismissNotification = jest.fn();
const mockRestartIndexingOnCourse = jest.fn();
const mockDeleteCourseItem = jest.fn();
const mockGetCourseItem = jest.fn();

jest.mock('./api', () => ({
  setVideoSharingOption: (...args: any[]) => mockSetVideoSharingOption(...args),
  enableCourseHighlightsEmails: (...args: any[]) => mockEnableCourseHighlightsEmails(...args),
  dismissNotification: (...args: any[]) => mockDismissNotification(...args),
  restartIndexingOnCourse: (...args: any[]) => mockRestartIndexingOnCourse(...args),
  deleteCourseItem: (...args: any[]) => mockDeleteCourseItem(...args),
  getCourseItem: (...args: any[]) => mockGetCourseItem(...args),
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
  useCourseItemData,
} from './apiHooks';

const courseId = 'course-v1:edX+DemoX+Demo_Course';
const STUDIO_BASE_URL = 'http://localhost:18010';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// buildTestOutline is imported from __mocks__ — provides buildTestOutline([...])
// and buildTestOutline({ sections: [...], overrides: {...} }).

// ---------------------------------------------------------------------------
// useSetVideoSharingOption
// ---------------------------------------------------------------------------
describe('useSetVideoSharingOption', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    initializeMocks();
  });

  it('invalidates outline-index query on success (triggers refetch)', async () => {
    const { queryClient } = initializeMocks();
    mockSetVideoSharingOption.mockResolvedValue({});

    queryClient.setQueryData(courseOutlineQueryKeys.index(courseId), {
      courseStructure: { childInfo: { children: [] } },
      statusBar: { videoSharingOptions: 'per-video' },
    });

    const { result } = renderHook(() => useSetVideoSharingOption(courseId), { wrapper: makeWrapper() });

    await act(async () => {
      await result.current.mutateAsync('per-course');
    });

    // After invalidation, the query is marked invalidated
    const state = queryClient.getQueryState(courseOutlineQueryKeys.index(courseId));
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

  it('invalidates outline-index query on success', async () => {
    const { queryClient } = initializeMocks();
    mockEnableCourseHighlightsEmails.mockResolvedValue({});

    queryClient.setQueryData(courseOutlineQueryKeys.index(courseId), {
      courseStructure: { childInfo: { children: [] } },
    });

    const { result } = renderHook(() => useEnableCourseHighlightsEmails(courseId), { wrapper: makeWrapper() });

    await act(async () => {
      await result.current.mutateAsync();
    });

    const state = queryClient.getQueryState(courseOutlineQueryKeys.index(courseId));
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
});

// ---------------------------------------------------------------------------
// useCourseOutlineSavingStatus
// ---------------------------------------------------------------------------
describe('useCourseOutlineSavingStatus', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    initializeMocks();
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
    await new Promise((r) => {
      setTimeout(r, 5);
    });

    // Second mutation: error
    await act(async () => {
      try {
        await mutResult.current.mutateAsync();
      } catch { /* expected */ }
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
      new Promise((resolve) => {
        resolveSecond = resolve;
      }),
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

    const outlineData = buildTestOutline([
      { id: chapterId, displayName: 'Chapter 1' },
      { id: chapter2Id, displayName: 'Chapter 2' },
    ]);
    queryClient.setQueryData(courseOutlineQueryKeys.index(courseId), outlineData);

    const { result } = renderHook(() => useDeleteCourseItem(courseId), { wrapper: makeWrapper() });

    await act(async () => {
      await result.current.mutateAsync({ itemId: chapterId, sectionId: chapterId });
    });

    const updated = queryClient.getQueryData(courseOutlineQueryKeys.index(courseId)) as any;
    expect(updated.courseStructure.childInfo.children).toHaveLength(1);
    expect(updated.courseStructure.childInfo.children[0].id).toBe(chapter2Id);
  });

  it('removes sequential from its parent section children on sequential delete', async () => {
    const { queryClient } = initializeMocks();

    const outlineData = buildTestOutline([
      {
        id: chapterId,
        displayName: 'Ch 1',
        children: [
          { id: seqId, displayName: 'Seq 1' },
          { id: seq2Id, displayName: 'Seq 2' },
        ],
      },
    ]);
    queryClient.setQueryData(courseOutlineQueryKeys.index(courseId), outlineData);

    const { result } = renderHook(() => useDeleteCourseItem(courseId), { wrapper: makeWrapper() });

    await act(async () => {
      await result.current.mutateAsync({ itemId: seqId, sectionId: chapterId });
    });

    const updated = queryClient.getQueryData(courseOutlineQueryKeys.index(courseId)) as any;
    const section = updated.courseStructure.childInfo.children[0];
    expect(section.childInfo.children).toHaveLength(1);
    expect(section.childInfo.children[0].id).toBe(seq2Id);
  });

  it('removes unit from its parent subsection children on vertical delete', async () => {
    const { queryClient } = initializeMocks();

    const outlineData = buildTestOutline([
      {
        id: chapterId,
        displayName: 'Ch 1',
        children: [
          {
            id: seqId,
            displayName: 'Seq 1',
            children: [
              { id: unitId, displayName: 'Unit 1' },
              { id: unit2Id, displayName: 'Unit 2' },
            ],
          },
        ],
      },
    ]);
    queryClient.setQueryData(courseOutlineQueryKeys.index(courseId), outlineData);

    const { result } = renderHook(() => useDeleteCourseItem(courseId), { wrapper: makeWrapper() });

    await act(async () => {
      await result.current.mutateAsync({ itemId: unitId, sectionId: chapterId, subsectionId: seqId });
    });

    const updated = queryClient.getQueryData(courseOutlineQueryKeys.index(courseId)) as any;
    const subsection = updated.courseStructure.childInfo.children[0].childInfo.children[0];
    expect(subsection.childInfo.children).toHaveLength(1);
    expect(subsection.childInfo.children[0].id).toBe(unit2Id);
  });

  it('does not modify cache for non-matching category (e.g. "course")', async () => {
    const { queryClient } = initializeMocks();

    const outlineData = buildTestOutline([
      { id: chapterId, displayName: 'Ch 1', children: [{ id: seqId, displayName: 'Seq 1' }] },
    ]);
    queryClient.setQueryData(courseOutlineQueryKeys.index(courseId), outlineData);
    const before = queryClient.getQueryData(courseOutlineQueryKeys.index(courseId));

    const courseBlockId = 'block-v1:edX+DemoX+Demo_Course+type@course+block@course';
    const { result } = renderHook(() => useDeleteCourseItem(courseId), { wrapper: makeWrapper() });

    await act(async () => {
      await result.current.mutateAsync({ itemId: courseBlockId, sectionId: courseBlockId });
    });

    const after = queryClient.getQueryData(courseOutlineQueryKeys.index(courseId));
    expect(after).toEqual(before);
  });

  it('does not invalidate deleted item own query key (no self-refetch)', async () => {
    mockDeleteCourseItem.mockResolvedValue({});
    const { queryClient } = initializeMocks();
    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useDeleteCourseItem(courseId), { wrapper: makeWrapper() });

    await act(async () => {
      await result.current.mutateAsync({ itemId: seqId, sectionId: chapterId });
    });

    // The deleted item's own query should NOT be invalidated — that would
    // trigger a 404 refetch. Stale-selection prevention is handled by
    // useOutlineModals.onDeleteConfirm clearing currentSelection on success.
    expect(invalidateSpy).not.toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: courseOutlineQueryKeys.courseItemId(seqId) }),
    );

    // Course details invalidation should still fire
    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: courseOutlineQueryKeys.courseDetails(expect.any(String)) }),
    );

    invalidateSpy.mockRestore();
  });
});

// ---------------------------------------------------------------------------
// useCourseItemData — cache priming
// ---------------------------------------------------------------------------
describe('useCourseItemData cache priming', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    initializeMocks();
  });

  it('primes child, grandchild, and great-grandchild caches recursively with deterministic await order', async () => {
    const { queryClient } = initializeMocks();

    // Build a 4-level tree: chapter → sequential → vertical → vertical (deep leaf)
    const greatGrandchild = {
      id: 'block-v1:edX+DemoX+Demo_Course+type@vertical+block@greatgrandchild',
      category: 'vertical',
      childInfo: { children: [] },
    };
    const grandchild = {
      id: 'block-v1:edX+DemoX+Demo_Course+type@vertical+block@grandchild',
      category: 'vertical',
      childInfo: { children: [greatGrandchild] },
    };
    const child = {
      id: 'block-v1:edX+DemoX+Demo_Course+type@sequential+block@child',
      category: 'sequential',
      childInfo: { children: [grandchild] },
    };
    const root = {
      id: 'block-v1:edX+DemoX+Demo_Course+type@chapter+block@root',
      category: 'chapter',
      childInfo: { children: [child] },
    };

    mockGetCourseItem.mockResolvedValue(root);

    const { result } = renderHook(
      () => useCourseItemData(root.id),
      { wrapper: makeWrapper() },
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Verify root is cached
    expect(queryClient.getQueryData(courseOutlineQueryKeys.courseItemId(root.id))).toEqual(root);

    // Verify child is cached
    const childCached = queryClient.getQueryData(courseOutlineQueryKeys.courseItemId(child.id));
    expect(childCached).toEqual(child);

    // Verify grandchild is cached
    const grandchildCached = queryClient.getQueryData(courseOutlineQueryKeys.courseItemId(grandchild.id));
    expect(grandchildCached).toEqual(grandchild);

    // Verify great-grandchild is cached (proves depth beyond the original 3-level hardcode)
    const greatGrandchildCached = queryClient.getQueryData(courseOutlineQueryKeys.courseItemId(greatGrandchild.id));
    expect(greatGrandchildCached).toEqual(greatGrandchild);

    // Verify getCourseItem was called exactly once (all child reads from cache)
    expect(mockGetCourseItem).toHaveBeenCalledTimes(1);
  });

  it('handles node with childInfo key set to undefined without throwing', async () => {
    const { queryClient } = initializeMocks();
    const noChildren = {
      id: 'block-v1:edX+DemoX+Demo_Course+type@vertical+block@no-childinfo',
      category: 'vertical',
      childInfo: undefined,
    };
    mockGetCourseItem.mockResolvedValue(noChildren);

    const { result } = renderHook(
      () => useCourseItemData(noChildren.id),
      { wrapper: makeWrapper() },
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(queryClient.getQueryData(courseOutlineQueryKeys.courseItemId(noChildren.id))).toEqual(noChildren);
  });

  it('handles node with missing children array without throwing', async () => {
    const { queryClient } = initializeMocks();
    const noChildren = {
      id: 'block-v1:edX+DemoX+Demo_Course+type@vertical+block@no-children',
      category: 'vertical',
      childInfo: {},
    };
    mockGetCourseItem.mockResolvedValue(noChildren);

    const { result } = renderHook(
      () => useCourseItemData(noChildren.id),
      { wrapper: makeWrapper() },
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(queryClient.getQueryData(courseOutlineQueryKeys.courseItemId(noChildren.id))).toEqual(noChildren);
  });
});
