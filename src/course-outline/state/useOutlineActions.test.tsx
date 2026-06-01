import { renderHook, act } from '@testing-library/react';
import { useOutlineActions } from './useOutlineActions';

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------
const courseId = 'course-v1:test+course';
const chapterSelection = {
  category: 'chapter' as const,
  currentId: 'block-v1:test+course+type@chapter+block@ch1',
  sectionId: 'block-v1:test+course+type@chapter+block@ch1',
};
const sequentialSelection = {
  category: 'sequential' as const,
  currentId: 'block-v1:test+course+type@sequential+block@subsec1',
  sectionId: 'block-v1:test+course+type@chapter+block@sec1',
  subsectionId: 'block-v1:test+course+type@sequential+block@subsec1',
};
const verticalSelection = {
  category: 'vertical' as const,
  currentId: 'block-v1:test+course+type@vertical+block@unit1',
  subsectionId: 'block-v1:test+course+type@sequential+block@subsec1',
  sectionId: 'block-v1:test+course+type@chapter+block@sec1',
};

// ---------------------------------------------------------------------------
// Mocks — jest.mock is hoisted above imports
// ---------------------------------------------------------------------------
const mockDeleteMutateAsync = jest.fn();
const mockSectionMutate = jest.fn();
const mockSubsectionMutate = jest.fn();
const mockUnitMutate = jest.fn();

jest.mock('../data/apiHooks', () => ({
  useDeleteCourseItem: () => ({ mutateAsync: mockDeleteMutateAsync }),
  useConfigureSection: () => ({ mutate: mockSectionMutate }),
  useConfigureSubsection: () => ({ mutate: mockSubsectionMutate }),
  useConfigureUnit: () => ({ mutate: mockUnitMutate }),
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function renderActionsHook() {
  return renderHook(() => useOutlineActions(courseId));
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('useOutlineActions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('handleDeleteItemSubmit', () => {
    it('returns false when selection is undefined (defensive)', async () => {
      const { result } = renderActionsHook();

      let res;
      await act(async () => {
        res = await result.current.handleDeleteItemSubmit(undefined as any);
      });

      expect(res).toBe(false);
      expect(mockDeleteMutateAsync).not.toHaveBeenCalled();
    });

    it('returns false when selection lacks category (defensive)', async () => {
      const { result } = renderActionsHook();

      let res;
      await act(async () => {
        res = await result.current.handleDeleteItemSubmit({} as any);
      });

      expect(res).toBe(false);
      expect(mockDeleteMutateAsync).not.toHaveBeenCalled();
    });

    it('returns true on successful chapter delete', async () => {
      mockDeleteMutateAsync.mockResolvedValue(undefined);
      const { result } = renderActionsHook();

      let res;
      await act(async () => {
        res = await result.current.handleDeleteItemSubmit(chapterSelection);
      });

      expect(res).toBe(true);
      expect(mockDeleteMutateAsync).toHaveBeenCalledWith({ itemId: chapterSelection.currentId });
    });

    it('returns true on successful sequential delete', async () => {
      mockDeleteMutateAsync.mockResolvedValue(undefined);
      const { result } = renderActionsHook();

      let res;
      await act(async () => {
        res = await result.current.handleDeleteItemSubmit(sequentialSelection);
      });

      expect(res).toBe(true);
      expect(mockDeleteMutateAsync).toHaveBeenCalledWith({
        itemId: sequentialSelection.currentId,
        sectionId: sequentialSelection.sectionId,
      });
    });

    it('returns true on successful vertical delete', async () => {
      mockDeleteMutateAsync.mockResolvedValue(undefined);
      const { result } = renderActionsHook();

      let res;
      await act(async () => {
        res = await result.current.handleDeleteItemSubmit(verticalSelection);
      });

      expect(res).toBe(true);
      expect(mockDeleteMutateAsync).toHaveBeenCalledWith({
        itemId: verticalSelection.currentId,
        subsectionId: verticalSelection.subsectionId,
        sectionId: verticalSelection.sectionId,
      });
    });

    it('returns false on mutation failure (does not throw)', async () => {
      mockDeleteMutateAsync.mockRejectedValue(new Error('delete failed'));
      const { result } = renderActionsHook();

      let res;
      await act(async () => {
        // Should not throw — error is caught internally
        res = await result.current.handleDeleteItemSubmit(chapterSelection);
      });

      expect(res).toBe(false);
      expect(mockDeleteMutateAsync).toHaveBeenCalled();
    });
  });

  describe('handleConfigureItemSubmit', () => {
    it('dispatches to section mutation for chapters with realistic config', () => {
      const { result } = renderActionsHook();
      const payload = {
        category: 'chapter' as const,
        sectionId: chapterSelection.sectionId,
        isVisibleToStaffOnly: true,
        startDatetime: '2025-06-01T00:00:00',
      };

      act(() => {
        result.current.handleConfigureItemSubmit(payload);
      });

      expect(mockSectionMutate).toHaveBeenCalledWith({
        sectionId: chapterSelection.sectionId,
        isVisibleToStaffOnly: true,
        startDatetime: '2025-06-01T00:00:00',
      });
    });

    it('dispatches to subsection mutation for sequentials with realistic config', () => {
      const { result } = renderActionsHook();
      const payload = {
        category: 'sequential' as const,
        itemId: sequentialSelection.currentId,
        sectionId: sequentialSelection.sectionId,
        isVisibleToStaffOnly: false,
        releaseDate: '2025-07-01T00:00:00',
        graderType: 'Homework',
        dueDate: '2025-07-15T00:00:00',
      };

      act(() => {
        result.current.handleConfigureItemSubmit(payload);
      });

      expect(mockSubsectionMutate).toHaveBeenCalledWith({
        itemId: sequentialSelection.currentId,
        sectionId: sequentialSelection.sectionId,
        isVisibleToStaffOnly: false,
        releaseDate: '2025-07-01T00:00:00',
        graderType: 'Homework',
        dueDate: '2025-07-15T00:00:00',
      });
    });

    it('dispatches to unit mutation for verticals with realistic config', () => {
      const { result } = renderActionsHook();
      const payload = {
        category: 'vertical' as const,
        unitId: verticalSelection.currentId,
        sectionId: verticalSelection.sectionId,
        isVisibleToStaffOnly: false,
        type: 'republish' as const,
        groupAccess: {},
        discussionEnabled: true,
      };

      act(() => {
        result.current.handleConfigureItemSubmit(payload);
      });

      expect(mockUnitMutate).toHaveBeenCalledWith({
        unitId: verticalSelection.currentId,
        sectionId: verticalSelection.sectionId,
        isVisibleToStaffOnly: false,
        type: 'republish',
        groupAccess: {},
        discussionEnabled: true,
      });
    });

    it('does nothing when payload is undefined (defensive)', () => {
      const { result } = renderActionsHook();

      act(() => {
        result.current.handleConfigureItemSubmit(undefined as any);
      });

      expect(mockSectionMutate).not.toHaveBeenCalled();
      expect(mockSubsectionMutate).not.toHaveBeenCalled();
      expect(mockUnitMutate).not.toHaveBeenCalled();
    });
  });
});
