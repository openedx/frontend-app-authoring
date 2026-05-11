import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { courseOutlineIndexQueryKey } from '../data/outlineIndexQuery';
import { useOutlineReorderState } from './useOutlineReorderState';

// Mock the apiHooks module so the reorder mutation hooks return controllable fns
const mockMutateAsync = {
  sections: jest.fn(),
  subsections: jest.fn(),
  units: jest.fn(),
};

jest.mock('../data/apiHooks', () => ({
  useReorderSections: jest.fn(() => ({ mutateAsync: mockMutateAsync.sections })),
  useReorderSubsections: jest.fn(() => ({ mutateAsync: mockMutateAsync.subsections })),
  useReorderUnits: jest.fn(() => ({ mutateAsync: mockMutateAsync.units })),
}));

const courseId = 'course-v1:test+course+2025';

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

const wrapper = ({ children }: { children: React.ReactNode }) => (
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
  });

  describe('commitSubsectionReorder', () => {
    it('rolls back preview on subsection reorder failure', async () => {
      const { result } = renderReorderHook();

      // Set up a preview
      act(() => {
        result.current.previewSections([sections[1], sections[0], sections[2]]);
      });
      expect(result.current.visibleSections.map((s: any) => s.id)).toEqual(['B', 'A', 'C']);

      mockMutateAsync.subsections.mockRejectedValueOnce(new Error('fail'));

      await act(async () => {
        // Call resolves (catch swallows error) — no throw expected
        await result.current.commitSubsectionReorder('section1', 'prevSection1', ['sub1', 'sub2']);
      });

      // Preview cleared
      expect(result.current.visibleSections.map((s: any) => s.id)).toEqual(['A', 'B', 'C']);
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
        // Call resolves (catch swallows error) — no throw expected
        await result.current.commitUnitReorder('section1', 'prevSection1', 'subsection1', ['unit1', 'unit2']);
      });

      expect(result.current.visibleSections.map((s: any) => s.id)).toEqual(['A', 'B', 'C']);
    });
  });
});
