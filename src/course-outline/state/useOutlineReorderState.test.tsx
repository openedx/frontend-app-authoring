import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { courseOutlineIndexQueryKey } from '../data/outlineIndexQuery';
import { useOutlineReorderState } from './useOutlineReorderState';
import { moveSubsection, moveUnit } from '../drag-helper/utils';

// Mock the apiHooks module so the reorder mutation hooks return controllable fns
// and replaceSectionInOutlineIndex is a spy.
const mockMutateAsync = {
  sections: jest.fn(),
  subsections: jest.fn(),
  units: jest.fn(),
};

// jest.mock factories are evaluated during import resolution (before let/const
// assignments run at module level), so wrap mock references in closures.
// Actual mock fn is assigned in beforeEach.
let mockReplaceSectionInOutlineIndex: jest.Mock;
let mockGetCourseItem: jest.Mock;

jest.mock('../data/apiHooks', () => ({
  replaceSectionInOutlineIndex: (...args: any[]) => mockReplaceSectionInOutlineIndex(...args),
  useReorderSections: jest.fn(() => ({ mutateAsync: mockMutateAsync.sections })),
  useReorderSubsections: jest.fn(() => ({ mutateAsync: mockMutateAsync.subsections })),
  useReorderUnits: jest.fn(() => ({ mutateAsync: mockMutateAsync.units })),
}));

jest.mock('../data/api', () => ({
  getCourseItem: (...args: any[]) => mockGetCourseItem(...args),
}));

const courseId = 'course-v1:test+course+2025';

const createSubsection = (id: string): any => ({
  id,
  displayName: `Sub ${id}`,
  category: 'sequential',
  actions: { deletable: true, draggable: true, childAddable: true, duplicable: true },
  childInfo: { children: [] },
});

const createSection = (id: string): any => ({
  id,
  displayName: `Section ${id}`,
  category: 'chapter',
  actions: { deletable: true, draggable: true, childAddable: true, duplicable: true },
  childInfo: { children: [] },
});

const sections: any[] = [
  createSection('A'),
  createSection('B'),
  createSection('C'),
];

let queryClient: QueryClient;

const wrapper = ({ children }: { children: React.ReactNode; }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

function renderReorderHook() {
  return renderHook(() => useOutlineReorderState({ courseId, sections }), { wrapper });
}

describe('useOutlineReorderState', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Initialize mock delegates after jest.clearAllMocks resets them.
    mockReplaceSectionInOutlineIndex = jest.fn();
    mockGetCourseItem = jest.fn();
    queryClient = new QueryClient();

    // Seed the query cache with outline index data containing the sections
    queryClient.setQueryData(courseOutlineIndexQueryKey(courseId), {
      courseStructure: {
        id: courseId,
        childInfo: {
          children: sections.map((s) => ({ ...s })),
        },
      },
    });
  });

  describe('updateSectionOrderByIndex', () => {
    it('moves section from index 0 to 1 on success and updates cache', async () => {
      const { result } = renderReorderHook();

      expect(result.current.visibleSections.map((s: any) => s.id)).toEqual(['A', 'B', 'C']);

      mockMutateAsync.sections.mockResolvedValueOnce(undefined);

      await act(async () => {
        await result.current.updateSectionOrderByIndex(0, 1);
      });

      // Mutation called with reordered ids
      expect(mockMutateAsync.sections).toHaveBeenCalledWith(['B', 'A', 'C']);

      // visibleSections settles back to source (preview cleared)
      expect(result.current.visibleSections.map((s: any) => s.id)).toEqual(['A', 'B', 'C']);

      // Query cache updated with new order
      const cached: any = queryClient.getQueryData(courseOutlineIndexQueryKey(courseId));
      const cachedIds = cached?.courseStructure?.childInfo?.children?.map((s: any) => s.id);
      expect(cachedIds).toEqual(['B', 'A', 'C']);
    });

    it('rolls back preview on failure and leaves cache unchanged', async () => {
      const { result } = renderReorderHook();

      mockMutateAsync.sections.mockRejectedValueOnce(new Error('fail'));

      await act(async () => {
        // Call resolves (catch swallows error) — no throw expected
        await result.current.updateSectionOrderByIndex(0, 1);
      });

      // visibleSections returned to original source (preview cleared)
      expect(result.current.visibleSections.map((s: any) => s.id)).toEqual(['A', 'B', 'C']);

      // Cache order unchanged
      const cached: any = queryClient.getQueryData(courseOutlineIndexQueryKey(courseId));
      const cachedIds = cached?.courseStructure?.childInfo?.children?.map((s: any) => s.id);
      expect(cachedIds).toEqual(['A', 'B', 'C']);
    });
  });

  describe('previewSections / cancelReorderPreview', () => {
    it('previews then cancels without calling mutation', () => {
      const { result } = renderReorderHook();

      act(() => {
        result.current.previewSections([sections[1], sections[0], sections[2]]);
      });

      expect(result.current.visibleSections.map((s: any) => s.id)).toEqual(['B', 'A', 'C']);

      act(() => {
        result.current.cancelReorderPreview();
      });

      expect(result.current.visibleSections.map((s: any) => s.id)).toEqual(['A', 'B', 'C']);
      expect(mockMutateAsync.sections).not.toHaveBeenCalled();
    });
  });

  describe('commitSectionReorder', () => {
    it('commits reorder on success and updates cache', async () => {
      const { result } = renderReorderHook();

      mockMutateAsync.sections.mockResolvedValueOnce(undefined);

      await act(async () => {
        await result.current.commitSectionReorder(['B', 'A', 'C']);
      });

      expect(mockMutateAsync.sections).toHaveBeenCalledWith(['B', 'A', 'C']);

      const cached: any = queryClient.getQueryData(courseOutlineIndexQueryKey(courseId));
      const cachedIds = cached?.courseStructure?.childInfo?.children?.map((s: any) => s.id);
      expect(cachedIds).toEqual(['B', 'A', 'C']);
    });

    it('rolls back preview on commit failure', async () => {
      const { result } = renderReorderHook();

      // Start with a preview
      act(() => {
        result.current.previewSections([sections[1], sections[0], sections[2]]);
      });
      expect(result.current.visibleSections.map((s: any) => s.id)).toEqual(['B', 'A', 'C']);

      mockMutateAsync.sections.mockRejectedValueOnce(new Error('fail'));

      await act(async () => {
        // Call resolves (catch swallows error) — no throw expected
        await result.current.commitSectionReorder(['B', 'A', 'C']);
      });

      // Preview cleared — visibleSections back to source
      expect(result.current.visibleSections.map((s: any) => s.id)).toEqual(['A', 'B', 'C']);
    });

    it('invalidates cache when sectionListIds contains id missing from cache', async () => {
      // Inject spy on invalidateQueries
      const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderReorderHook();

      mockMutateAsync.sections.mockResolvedValueOnce(undefined);

      // 'D' does not exist in the cache (only A, B, C are seeded)
      await act(async () => {
        await result.current.commitSectionReorder(['A', 'D', 'C']);
      });

      // Mutation was called
      expect(mockMutateAsync.sections).toHaveBeenCalledWith(['A', 'D', 'C']);

      // Cache unchanged — still shows original order
      const cached: any = queryClient.getQueryData(courseOutlineIndexQueryKey(courseId));
      const cachedIds = cached?.courseStructure?.childInfo?.children?.map((s: any) => s.id);
      expect(cachedIds).toEqual(['A', 'B', 'C']);

      // Invalidation triggered because ids mismatch
      expect(invalidateSpy).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: courseOutlineIndexQueryKey(courseId) }),
      );

      invalidateSpy.mockRestore();
    });

    it('does not modify cache when cache has no outlineIndex structure', async () => {
      // Remove the cached outline data so the updater sees no structure.
      queryClient.removeQueries({ queryKey: courseOutlineIndexQueryKey(courseId) });
      expect(queryClient.getQueryData(courseOutlineIndexQueryKey(courseId))).toBeUndefined();

      const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderReorderHook();

      mockMutateAsync.sections.mockResolvedValueOnce(undefined);

      await act(async () => {
        await result.current.commitSectionReorder(['A', 'B', 'C']);
      });

      // Cache stays undefined — updater returns undefined unchanged
      expect(queryClient.getQueryData(courseOutlineIndexQueryKey(courseId))).toBeUndefined();

      // No invalidation (cache was empty, nothing to invalidate)
      expect(invalidateSpy).not.toHaveBeenCalled();

      invalidateSpy.mockRestore();
    });

    it('preserves unrelated cache fields when updater writes reordered children', async () => {
      // Add a custom field to the cached data that the updater must carry through.
      const prior: any = queryClient.getQueryData(courseOutlineIndexQueryKey(courseId));
      queryClient.setQueryData(courseOutlineIndexQueryKey(courseId), {
        ...prior,
        customMeta: { source: 'test' },
      });

      const { result } = renderReorderHook();
      mockMutateAsync.sections.mockResolvedValueOnce(undefined);

      await act(async () => {
        await result.current.commitSectionReorder(['B', 'A', 'C']);
      });

      const cached: any = queryClient.getQueryData(courseOutlineIndexQueryKey(courseId));
      // customMeta survived the updater
      expect(cached.customMeta).toEqual({ source: 'test' });
      // Children were reordered
      expect(cached.courseStructure.childInfo.children.map((s: any) => s.id)).toEqual(['B', 'A', 'C']);
    });

    it('does not resurrect concurrently-removed section during reorder write', async () => {
      // Simulate a concurrent cache change that removes section B in the
      // microtask gap between the mutation resolving and the reorder updater
      // running. The old getQueryData + setQueryData pattern would write
      // back stale children that include B, resurrecting it.
      // The updater form reads the latest cache at write time, sees B is
      // absent, sets shouldInvalidate, and returns old unchanged.
      //
      // We inject the concurrent change inside the mocked mutateAsync.
      // Note: we do NOT call the pre-mockImplementation version of
      // mockMutateAsync.sections because it is the SAME function reference
      // (would cause infinite recursion).
      mockMutateAsync.sections.mockImplementation(async () => {
        // Inject concurrent change: remove section B from cache.
        // This runs in the microtask gap before
        // acceptReorderAndSyncSectionOrder's setQueryData.
        queryClient.setQueryData(courseOutlineIndexQueryKey(courseId), (old: any) => ({
          ...old,
          courseStructure: {
            ...old.courseStructure,
            childInfo: {
              ...old.courseStructure.childInfo,
              children: old.courseStructure.childInfo.children.filter((s: any) => s.id !== 'B'),
            },
          },
        }));
        return undefined;
      });

      const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderReorderHook();

      const before: any = queryClient.getQueryData(courseOutlineIndexQueryKey(courseId));
      expect(before.courseStructure.childInfo.children.map((s: any) => s.id)).toEqual(['A', 'B', 'C']);

      await act(async () => {
        await result.current.commitSectionReorder(['B', 'A', 'C']);
      });

      // B was removed by concurrent change; reorder updater saw B absent
      // and triggered invalidation.
      const after: any = queryClient.getQueryData(courseOutlineIndexQueryKey(courseId));
      const afterIds = after?.courseStructure?.childInfo?.children?.map((s: any) => s.id) || [];
      expect(afterIds).not.toContain('B');

      // Invalidation was triggered because B was missing from cache
      expect(invalidateSpy).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: courseOutlineIndexQueryKey(courseId) }),
      );

      invalidateSpy.mockRestore();
    });
  });

  describe('commitSubsectionReorder', () => {
    it('rolls back preview on subsection reorder failure', async () => {
      const { result } = renderReorderHook();

      act(() => {
        result.current.previewSections([sections[1], sections[0], sections[2]]);
      });
      expect(result.current.visibleSections.map((s: any) => s.id)).toEqual(['B', 'A', 'C']);

      mockMutateAsync.subsections.mockRejectedValueOnce(new Error('fail'));

      await act(async () => {
        await result.current.commitSubsectionReorder('section1', 'prevSection1', ['sub1', 'sub2']);
      });

      expect(result.current.visibleSections.map((s: any) => s.id)).toEqual(['A', 'B', 'C']);
    });

    it('syncs preview tree to cache on success', async () => {
      const { result } = renderReorderHook();

      act(() => {
        result.current.previewSections([sections[1], sections[0], sections[2]]);
      });
      expect(result.current.visibleSections.map((s: any) => s.id)).toEqual(['B', 'A', 'C']);

      mockMutateAsync.subsections.mockResolvedValueOnce(undefined);

      // Cache should reflect the preview tree (B, A, C) after success.
      await act(async () => {
        await result.current.commitSubsectionReorder('section1', 'prevSection1', ['sub1', 'sub2']);
      });

      const cached: any = queryClient.getQueryData(courseOutlineIndexQueryKey(courseId));
      const cachedIds = cached?.courseStructure?.childInfo?.children.map((s: any) => s.id);
      expect(cachedIds).toEqual(['B', 'A', 'C']);
    });
  });

  describe('commitUnitReorder', () => {
    it('rolls back preview on unit reorder failure', async () => {
      const { result } = renderReorderHook();

      act(() => {
        result.current.previewSections([sections[1], sections[0], sections[2]]);
      });
      expect(result.current.visibleSections.map((s: any) => s.id)).toEqual(['B', 'A', 'C']);

      mockMutateAsync.units.mockRejectedValueOnce(new Error('fail'));

      await act(async () => {
        await result.current.commitUnitReorder('section1', 'prevSection1', 'subsection1', ['unit1', 'unit2']);
      });

      expect(result.current.visibleSections.map((s: any) => s.id)).toEqual(['A', 'B', 'C']);
    });

    it('syncs preview tree to cache on success', async () => {
      const { result } = renderReorderHook();

      act(() => {
        result.current.previewSections([sections[1], sections[0], sections[2]]);
      });
      expect(result.current.visibleSections.map((s: any) => s.id)).toEqual(['B', 'A', 'C']);

      mockMutateAsync.units.mockResolvedValueOnce(undefined);

      await act(async () => {
        await result.current.commitUnitReorder('section1', 'prevSection1', 'subsection1', ['unit1', 'unit2']);
      });

      const cached: any = queryClient.getQueryData(courseOutlineIndexQueryKey(courseId));
      const cachedIds = cached?.courseStructure?.childInfo?.children.map((s: any) => s.id);
      expect(cachedIds).toEqual(['B', 'A', 'C']);
    });
  });

  describe('updateSubsectionOrderByIndex', () => {
    const sectionsWithSubs: any[] = [
      {
        ...createSection('X'),
        childInfo: {
          children: [createSubsection('x1'), createSubsection('x2')],
        },
      },
      {
        ...createSection('Y'),
        childInfo: { children: [createSubsection('y1')] },
      },
    ];

    beforeEach(() => {
      queryClient.setQueryData(courseOutlineIndexQueryKey(courseId), {
        courseStructure: {
          id: courseId,
          childInfo: { children: sectionsWithSubs.map((s: any) => ({ ...s })) },
        },
      });
    });

    it('syncs cache from preview tree on success', async () => {
      // Use the moveSubsection fn to build moveDetails.
      // Move x2 from index 1 to index 0 within section X.
      const moveDetails = {
        fn: moveSubsection,
        args: [sectionsWithSubs, 0, 1, 0],
        sectionId: 'X',
      };

      const [, newSubsections] = moveSubsection(
        sectionsWithSubs.map((s: any) => ({
          ...s,
          childInfo: { ...s.childInfo, children: [...s.childInfo.children] },
        })),
        0,
        1,
        0,
      );
      const expectedSubIds = newSubsections.map((s: any) => s.id);

      const { result } = renderReorderHook();
      mockMutateAsync.subsections.mockResolvedValueOnce(undefined);

      await act(async () => {
        await result.current.updateSubsectionOrderByIndex(sectionsWithSubs[0], moveDetails);
      });

      expect(mockMutateAsync.subsections).toHaveBeenCalledTimes(1);
      const cached: any = queryClient.getQueryData(courseOutlineIndexQueryKey(courseId));
      const cachedSection = cached?.courseStructure?.childInfo?.children[0];
      const cachedSubIds = cachedSection?.childInfo?.children.map((s: any) => s.id);
      expect(cachedSubIds).toEqual(expectedSubIds);
    });
  });

  describe('updateUnitOrderByIndex', () => {
    const sectionsWithUnits: any[] = [
      {
        ...createSection('M'),
        childInfo: {
          children: [
            {
              ...createSubsection('m1'),
              childInfo: {
                children: [
                  { id: 'm1u1', category: 'vertical', actions: { draggable: true } },
                  { id: 'm1u2', category: 'vertical', actions: { draggable: true } },
                ],
              },
            },
          ],
        },
      },
      {
        ...createSection('N'),
        childInfo: {
          children: [
            {
              ...createSubsection('n1'),
              childInfo: {
                children: [{ id: 'n1u1', category: 'vertical', actions: { draggable: true } }],
              },
            },
          ],
        },
      },
    ];

    beforeEach(() => {
      queryClient.setQueryData(courseOutlineIndexQueryKey(courseId), {
        courseStructure: {
          id: courseId,
          childInfo: { children: sectionsWithUnits.map((s: any) => ({ ...s })) },
        },
      });
    });

    it('syncs cache from preview tree on success', async () => {
      const moveDetails = {
        fn: moveUnit,
        args: [sectionsWithUnits, 0, 0, 1, 0],
        sectionId: 'M',
        subsectionId: 'm1',
      };

      const [, newUnits] = moveUnit(
        sectionsWithUnits.map((s: any) => ({
          ...s,
          childInfo: { ...s.childInfo, children: [...s.childInfo.children] },
        })),
        0,
        0,
        1,
        0,
      );
      const expectedUnitIds = newUnits.map((u: any) => u.id);

      const { result } = renderReorderHook();
      mockMutateAsync.units.mockResolvedValueOnce(undefined);

      await act(async () => {
        await result.current.updateUnitOrderByIndex(sectionsWithUnits[0], moveDetails);
      });

      expect(mockMutateAsync.units).toHaveBeenCalledTimes(1);
      const cached: any = queryClient.getQueryData(courseOutlineIndexQueryKey(courseId));
      const cachedSection = cached?.courseStructure?.childInfo?.children[0];
      const cachedSub = cachedSection?.childInfo?.children[0];
      const cachedUnitIds = cachedSub?.childInfo?.children.map((u: any) => u.id);
      expect(cachedUnitIds).toEqual(expectedUnitIds);
    });
  });

  // --- Refetch behavior for publish-status refresh ---

  describe('commitSubsectionReorder (refetch)', () => {
    it('refetches target section after success and merges fresh publish status', async () => {
      const freshSectionA = { ...sections[0], published: true, hasChanges: false };
      mockGetCourseItem.mockResolvedValue(freshSectionA);
      mockMutateAsync.subsections.mockResolvedValueOnce(undefined);

      const { result } = renderReorderHook();

      await act(async () => {
        await result.current.commitSubsectionReorder('A', 'A', ['sub1', 'sub2']);
      });

      expect(mockGetCourseItem).toHaveBeenCalledTimes(1);
      expect(mockGetCourseItem).toHaveBeenCalledWith('A');
      expect(mockReplaceSectionInOutlineIndex).toHaveBeenCalledWith(
        expect.any(Object),
        courseId,
        expect.objectContaining({ A: freshSectionA }),
      );
    });

    it('refetches both source and target sections on cross-section move', async () => {
      const freshTarget = { ...sections[0], published: true, hasChanges: false };
      const freshSource = { ...sections[1], published: false, hasChanges: true };
      mockGetCourseItem
        .mockResolvedValueOnce(freshTarget)
        .mockResolvedValueOnce(freshSource);
      mockMutateAsync.subsections.mockResolvedValueOnce(undefined);

      const { result } = renderReorderHook();

      await act(async () => {
        await result.current.commitSubsectionReorder('A', 'B', ['sub1', 'sub2']);
      });

      expect(mockGetCourseItem).toHaveBeenCalledTimes(2);
      expect(mockGetCourseItem).toHaveBeenCalledWith('A');
      expect(mockGetCourseItem).toHaveBeenCalledWith('B');
      expect(mockReplaceSectionInOutlineIndex).toHaveBeenCalledWith(
        expect.any(Object),
        courseId,
        expect.objectContaining({ A: freshTarget, B: freshSource }),
      );
    });

    it('does not refetch on mutation failure', async () => {
      mockMutateAsync.subsections.mockRejectedValueOnce(new Error('fail'));

      const { result } = renderReorderHook();

      await act(async () => {
        await result.current.commitSubsectionReorder('A', 'A', ['sub1', 'sub2']);
      });

      expect(mockGetCourseItem).not.toHaveBeenCalled();
      expect(mockReplaceSectionInOutlineIndex).not.toHaveBeenCalled();
    });

    it('falls back to invalidation when all refetches fail', async () => {
      mockGetCourseItem.mockRejectedValue(new Error('network error'));
      mockMutateAsync.subsections.mockResolvedValueOnce(undefined);

      const { result } = renderReorderHook();

      // Spy on invalidateQueries after queryClient is created in beforeEach
      const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

      await act(async () => {
        await result.current.commitSubsectionReorder('A', 'A', ['sub1', 'sub2']);
      });

      expect(mockReplaceSectionInOutlineIndex).not.toHaveBeenCalled();
      expect(invalidateSpy).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: courseOutlineIndexQueryKey(courseId) }),
      );

      invalidateSpy.mockRestore();
    });
  });

  describe('commitUnitReorder (refetch)', () => {
    it('refetches target section after success', async () => {
      const freshSectionB = { ...sections[1], published: true, hasChanges: false };
      mockGetCourseItem.mockResolvedValue(freshSectionB);
      mockMutateAsync.units.mockResolvedValueOnce(undefined);

      const { result } = renderReorderHook();

      await act(async () => {
        await result.current.commitUnitReorder('B', 'B', 'subsection1', ['unit1', 'unit2']);
      });

      expect(mockGetCourseItem).toHaveBeenCalledTimes(1);
      expect(mockGetCourseItem).toHaveBeenCalledWith('B');
      expect(mockReplaceSectionInOutlineIndex).toHaveBeenCalledWith(
        expect.any(Object),
        courseId,
        expect.objectContaining({ B: freshSectionB }),
      );
    });
  });

  describe('updateSubsectionOrderByIndex (refetch)', () => {
    const sectionsWithSubs: any[] = [
      {
        ...createSection('X'),
        childInfo: {
          children: [createSubsection('x1'), createSubsection('x2')],
        },
      },
      {
        ...createSection('Y'),
        childInfo: { children: [createSubsection('y1')] },
      },
    ];

    beforeEach(() => {
      queryClient.setQueryData(courseOutlineIndexQueryKey(courseId), {
        courseStructure: {
          id: courseId,
          childInfo: { children: sectionsWithSubs.map((s: any) => ({ ...s })) },
        },
      });
    });

    it('refetches section after successful subsection reorder by index (same-section deduped)', async () => {
      const moveDetails = {
        fn: moveSubsection,
        args: [sectionsWithSubs, 0, 1, 0],
        sectionId: 'X',
      };

      const freshSectionX = { ...sectionsWithSubs[0], published: true, hasChanges: false };
      mockGetCourseItem.mockResolvedValue(freshSectionX);
      mockMutateAsync.subsections.mockResolvedValueOnce(undefined);

      const { result } = renderReorderHook();

      await act(async () => {
        await result.current.updateSubsectionOrderByIndex(sectionsWithSubs[0], moveDetails);
      });

      expect(mockGetCourseItem).toHaveBeenCalledTimes(1);
      expect(mockGetCourseItem).toHaveBeenCalledWith('X');
      expect(mockReplaceSectionInOutlineIndex).toHaveBeenCalledWith(
        expect.any(Object),
        courseId,
        expect.objectContaining({ X: freshSectionX }),
      );
    });
  });

  describe('updateUnitOrderByIndex (refetch)', () => {
    const sectionsWithUnits: any[] = [
      {
        ...createSection('M'),
        childInfo: {
          children: [
            {
              ...createSubsection('m1'),
              childInfo: {
                children: [
                  { id: 'm1u1', category: 'vertical', actions: { draggable: true } },
                  { id: 'm1u2', category: 'vertical', actions: { draggable: true } },
                ],
              },
            },
          ],
        },
      },
      {
        ...createSection('N'),
        childInfo: {
          children: [
            {
              ...createSubsection('n1'),
              childInfo: {
                children: [{ id: 'n1u1', category: 'vertical', actions: { draggable: true } }],
              },
            },
          ],
        },
      },
    ];

    beforeEach(() => {
      queryClient.setQueryData(courseOutlineIndexQueryKey(courseId), {
        courseStructure: {
          id: courseId,
          childInfo: { children: sectionsWithUnits.map((s: any) => ({ ...s })) },
        },
      });
    });

    it('refetches section after successful unit reorder by index (same-section deduped)', async () => {
      const moveDetails = {
        fn: moveUnit,
        args: [sectionsWithUnits, 0, 0, 1, 0],
        sectionId: 'M',
        subsectionId: 'm1',
      };

      const freshSectionM = { ...sectionsWithUnits[0], published: true, hasChanges: false };
      mockGetCourseItem.mockResolvedValue(freshSectionM);
      mockMutateAsync.units.mockResolvedValueOnce(undefined);

      const { result } = renderReorderHook();

      await act(async () => {
        await result.current.updateUnitOrderByIndex(sectionsWithUnits[0], moveDetails);
      });

      expect(mockGetCourseItem).toHaveBeenCalledTimes(1);
      expect(mockGetCourseItem).toHaveBeenCalledWith('M');
      expect(mockReplaceSectionInOutlineIndex).toHaveBeenCalledWith(
        expect.any(Object),
        courseId,
        expect.objectContaining({ M: freshSectionM }),
      );
    });
  });
});
