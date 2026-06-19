import { renderHook, act } from '@testing-library/react';
import type { OutlineActionSelection } from '@src/data/types';
import { useDeleteModal } from './useDeleteModal';

const courseId = 'course-v1:test+course';

const mockDeleteMutateAsync = jest.fn();
const mockCloseDeleteModal = jest.fn();
const mockClearSelection = jest.fn();
let mockDeleteModalData: any = undefined;
let mockCurrentSelection: any = undefined;

jest.mock('../CourseOutlineContext', () => ({
  useCourseOutlineContext: () => ({
    deleteModalData: mockDeleteModalData,
    closeDeleteModal: mockCloseDeleteModal,
    currentSelection: mockCurrentSelection,
    clearSelection: mockClearSelection,
  }),
}));

jest.mock('../data', () => ({
  useDeleteCourseItem: () => ({ mutateAsync: mockDeleteMutateAsync }),
}));

const chapterSelection: OutlineActionSelection = {
  category: 'chapter',
  currentId: 'block-v1:test+course+type@chapter+block@ch1',
  sectionId: 'block-v1:test+course+type@chapter+block@ch1',
};

const sequentialSelection: OutlineActionSelection = {
  category: 'sequential',
  currentId: 'block-v1:test+course+type@sequential+block@seq1',
  sectionId: 'block-v1:test+course+type@chapter+block@ch1',
  subsectionId: 'block-v1:test+course+type@sequential+block@seq1',
};

const verticalSelection: OutlineActionSelection = {
  category: 'vertical',
  currentId: 'block-v1:test+course+type@vertical+block@unit1',
  subsectionId: 'block-v1:test+course+type@sequential+block@seq1',
  sectionId: 'block-v1:test+course+type@chapter+block@ch1',
};

describe('useDeleteModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDeleteMutateAsync.mockResolvedValue(undefined);
    mockDeleteModalData = { ...chapterSelection };
    mockCurrentSelection = { ...chapterSelection };
  });

  describe('mutation routing', () => {
    it.each([
      ['chapter', chapterSelection, { itemId: chapterSelection.currentId }],
      ['sequential', sequentialSelection, {
        itemId: sequentialSelection.currentId,
        sectionId: sequentialSelection.sectionId,
      }],
      ['vertical', verticalSelection, {
        itemId: verticalSelection.currentId,
        subsectionId: verticalSelection.subsectionId,
        sectionId: verticalSelection.sectionId,
      }],
    ])(
      'routes category %s to deleteMutation.mutateAsync with correct payload',
      async (_, selection, expectedPayload) => {
        mockDeleteModalData = selection;
        const { result } = renderHook(() => useDeleteModal(courseId));
        await act(async () => {
          await result.current.onDeleteConfirm();
        });
        expect(mockDeleteMutateAsync).toHaveBeenCalledTimes(1);
        expect(mockDeleteMutateAsync).toHaveBeenCalledWith(expectedPayload);
      },
    );

    it('does not call mutation for unrecognized category', async () => {
      mockDeleteModalData = { category: 'unknown', currentId: 'some-id' } as any;
      const { result } = renderHook(() => useDeleteModal(courseId));
      await act(async () => {
        await result.current.onDeleteConfirm();
      });
      expect(mockDeleteMutateAsync).not.toHaveBeenCalled();
    });

    it('does not close modal when mutation throws', async () => {
      mockDeleteMutateAsync.mockRejectedValue(new Error('delete failed'));
      const { result } = renderHook(() => useDeleteModal(courseId));
      await act(async () => {
        await result.current.onDeleteConfirm();
      });
      expect(mockDeleteMutateAsync).toHaveBeenCalledTimes(1);
      expect(mockCloseDeleteModal).not.toHaveBeenCalled();
    });
  });

  describe('modal coordination', () => {
    it('closes modal and clears selection on success when currentSelection matches', async () => {
      mockCurrentSelection = { currentId: chapterSelection.currentId };
      const { result } = renderHook(() => useDeleteModal(courseId));
      await act(async () => {
        await result.current.onDeleteConfirm();
      });
      expect(mockCloseDeleteModal).toHaveBeenCalledTimes(1);
      expect(mockClearSelection).toHaveBeenCalledTimes(1);
    });

    it('closes modal but does NOT clear selection when currentSelection differs', async () => {
      mockCurrentSelection = { currentId: 'some-other-item' };
      const { result } = renderHook(() => useDeleteModal(courseId));
      await act(async () => {
        await result.current.onDeleteConfirm();
      });
      expect(mockCloseDeleteModal).toHaveBeenCalledTimes(1);
      expect(mockClearSelection).not.toHaveBeenCalled();
    });

    it('closes modal but does NOT clear selection when currentSelection is undefined', async () => {
      mockCurrentSelection = undefined;
      const { result } = renderHook(() => useDeleteModal(courseId));
      await act(async () => {
        await result.current.onDeleteConfirm();
      });
      expect(mockCloseDeleteModal).toHaveBeenCalledTimes(1);
      expect(mockClearSelection).not.toHaveBeenCalled();
    });
  });
});
