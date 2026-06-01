import { renderHook, act } from '@testing-library/react';
import { useOutlineActions } from './useOutlineActions';

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------
const courseId = 'course-v1:test+course';
const chapterSelection = {
  currentId: 'block-v1:test+course+type@chapter+block@ch1',
  sectionId: 'block-v1:test+course+type@chapter+block@ch1',
};
const sequentialSelection = {
  currentId: 'block-v1:test+course+type@sequential+block@subsec1',
  sectionId: 'block-v1:test+course+type@chapter+block@sec1',
};
const verticalSelection = {
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
    it('returns false early when selection is undefined', async () => {
      const { result } = renderActionsHook();

      let res;
      await act(async () => {
        res = await result.current.handleDeleteItemSubmit(undefined as any);
      });

      expect(res).toBe(false);
      expect(mockDeleteMutateAsync).not.toHaveBeenCalled();
    });

    it('returns false early when selection.currentId is undefined', async () => {
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
    it('dispatches to section mutation for chapters', () => {
      const { result } = renderActionsHook();
      const variables = { start: '2025-01-01', displayName: 'Updated Chapter' };

      act(() => {
        result.current.handleConfigureItemSubmit(chapterSelection, variables);
      });

      expect(mockSectionMutate).toHaveBeenCalledWith({
        sectionId: chapterSelection.sectionId,
        ...variables,
      });
    });

    it('dispatches to subsection mutation for sequentials', () => {
      const { result } = renderActionsHook();
      const variables = { due: '2025-06-01' };

      act(() => {
        result.current.handleConfigureItemSubmit(sequentialSelection, variables);
      });

      expect(mockSubsectionMutate).toHaveBeenCalledWith({
        itemId: sequentialSelection.currentId,
        sectionId: sequentialSelection.sectionId,
        ...variables,
      });
    });

    it('dispatches to unit mutation for verticals', () => {
      const { result } = renderActionsHook();
      const variables = { weight: 1.0 };

      act(() => {
        result.current.handleConfigureItemSubmit(verticalSelection, variables);
      });

      expect(mockUnitMutate).toHaveBeenCalledWith({
        unitId: verticalSelection.currentId,
        sectionId: verticalSelection.sectionId,
        ...variables,
      });
    });

    it('does nothing when selection is undefined', () => {
      const { result } = renderActionsHook();

      act(() => {
        result.current.handleConfigureItemSubmit(undefined as any, {});
      });

      expect(mockSectionMutate).not.toHaveBeenCalled();
      expect(mockSubsectionMutate).not.toHaveBeenCalled();
      expect(mockUnitMutate).not.toHaveBeenCalled();
    });
  });
});
