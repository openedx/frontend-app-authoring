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
    // Also reset mock implementations of the persistent mutation mocks
    // (jest.clearAllMocks does NOT clear mockReturnValueOnce / mockResolvedValueOnce).
    mockMutateAsync.sections.mockReset();
    mockMutateAsync.subsections.mockReset();
    mockMutateAsync.units.mockReset();
    // Initialize mock delegates.
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

  // --- updateSectionOrderByIndex ---

  describe('updateSectionOrderByIndex', () => {
    it('computes preview, calls mutation, and syncs cache on success', async () => {
      mockMutateAsync.sections.mockResolvedValueOnce(undefined);

      const { result } = renderReorderHook();

      await act(async () => {
        await result.current.updateSectionOrderByIndex(0, 2);
      });

      // Preview was set optimistically, then cleared on success — cache has final order
      expect(mockMutateAsync.sections).toHaveBeenCalledWith(['B', 'C', 'A']);
      const cached: any = queryClient.getQueryData(courseOutlineIndexQueryKey(courseId));
      expect(cached.courseStructure.childInfo.children.map((s: any) => s.id)).toEqual(['B', 'C', 'A']);
    });

    it('is a noop when currentIndex equals newIndex', async () => {
      const { result } = renderReorderHook();

      await act(async () => {
        await result.current.updateSectionOrderByIndex(1, 1);
      });

      expect(mockMutateAsync.sections).not.toHaveBeenCalled();
      expect(result.current.visibleSections.map((s: any) => s.id)).toEqual(['A', 'B', 'C']);
    });

    it('clears preview and does not write cache on mutation failure', async () => {
      mockMutateAsync.sections.mockRejectedValueOnce(new Error('fail'));

      const { result } = renderReorderHook();

      await act(async () => {
        await result.current.updateSectionOrderByIndex(0, 1);
      });

      // Preview was set optimistically, then cleared on failure
      expect(result.current.visibleSections.map((s: any) => s.id)).toEqual(['A', 'B', 'C']);
      // Cache unchanged
      const cached: any = queryClient.getQueryData(courseOutlineIndexQueryKey(courseId));
      expect(cached.courseStructure.childInfo.children.map((s: any) => s.id)).toEqual(['A', 'B', 'C']);
    });
  });

  // --- updateSubsectionOrderByIndex ---

  describe('updateSubsectionOrderByIndex', () => {
    it('moves subsection via moveDetails and calls subsection mutation', async () => {
      const sectionA = {
        ...sections[0],
        childInfo: {
          children: [
            createSubsection('sub1'),
            createSubsection('sub2'),
            createSubsection('sub3'),
          ],
        },
      };
      // Re-seed cache with the richer section
      queryClient.setQueryData(courseOutlineIndexQueryKey(courseId), (old: any) => ({
        ...old,
        courseStructure: {
          ...old.courseStructure,
          childInfo: {
            ...old.courseStructure.childInfo,
            children: [sectionA, sections[1], sections[2]],
          },
        },
      }));

      mockMutateAsync.subsections.mockResolvedValueOnce(undefined);
      mockGetCourseItem.mockResolvedValue(sectionA);

      // Simulate moving sub2 from index 2 → index 0 within section A
      // moveDetails has { fn, args, sectionId } as produced by possibleSubsectionMoves()
      const moveDetails = {
        fn: moveSubsection,
        args: [[sectionA, sections[1], sections[2]], 0, 2, 0],
        sectionId: 'A',
      };

      const { result } = renderReorderHook();

      await act(async () => {
        await result.current.updateSubsectionOrderByIndex(sectionA, moveDetails);
      });

      expect(mockMutateAsync.subsections).toHaveBeenCalledWith({
        sectionId: 'A',
        prevSectionId: 'A',
        subsectionListIds: ['sub3', 'sub1', 'sub2'],
      });
    });

    it('returns early when moveDetails has no args', async () => {
      const { result } = renderReorderHook();

      await act(async () => {
        await result.current.updateSubsectionOrderByIndex(sections[0], { fn: () => [], args: null, sectionId: 'A' });
      });

      expect(mockMutateAsync.subsections).not.toHaveBeenCalled();
    });
  });

  // --- updateUnitOrderByIndex ---

  describe('updateUnitOrderByIndex', () => {
    it('moves unit via moveDetails and calls unit mutation', async () => {
      const sectionA = {
        ...sections[0],
        childInfo: {
          children: [
            {
              ...createSubsection('sub1'),
              childInfo: {
                children: [
                  { id: 'unit1' }, { id: 'unit2' }, { id: 'unit3' },
                ],
              },
            },
          ],
        },
      };
      queryClient.setQueryData(courseOutlineIndexQueryKey(courseId), (old: any) => ({
        ...old,
        courseStructure: {
          ...old.courseStructure,
          childInfo: {
            ...old.courseStructure.childInfo,
            children: [sectionA, sections[1], sections[2]],
          },
        },
      }));

      mockMutateAsync.units.mockResolvedValueOnce(undefined);
      mockGetCourseItem.mockResolvedValue(sectionA);

      // Move unit3 from index 2 → index 0 within sub1
      // moveDetails has { fn, args, sectionId, subsectionId } as produced by possibleUnitMoves()
      const moveDetails = {
        fn: moveUnit,
        args: [[sectionA, sections[1], sections[2]], 0, 0, 2, 0],
        sectionId: 'A',
        subsectionId: 'sub1',
      };

      const { result } = renderReorderHook();

      await act(async () => {
        await result.current.updateUnitOrderByIndex(sectionA, moveDetails);
      });

      expect(mockMutateAsync.units).toHaveBeenCalledWith({
        sectionId: 'A',
        prevSectionId: 'A',
        subsectionId: 'sub1',
        unitListIds: ['unit3', 'unit1', 'unit2'],
      });
    });

    it('returns early when moveDetails has no args', async () => {
      const { result } = renderReorderHook();

      await act(async () => {
        await result.current.updateUnitOrderByIndex(sections[0], { fn: () => [], args: null, sectionId: 'A', subsectionId: 'sub1' });
      });

      expect(mockMutateAsync.units).not.toHaveBeenCalled();
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

});
