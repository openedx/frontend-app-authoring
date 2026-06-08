import { renderHook, act } from '@testing-library/react';
import { useDeleteModal } from './useDeleteModal';

const courseId = 'course-v1:test+course';
const chapterSelection = {
  category: 'chapter' as const,
  currentId: 'block-v1:test+course+type@chapter+block@ch1',
  sectionId: 'block-v1:test+course+type@chapter+block@ch1',
};

const mockCloseDeleteModal = jest.fn();
const mockClearSelection = jest.fn();
const mockHandleDeleteItemSubmit = jest.fn();
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

jest.mock('./useOutlineActions', () => ({
  useOutlineDeleteAction: () => ({
    handleDeleteItemSubmit: mockHandleDeleteItemSubmit,
  }),
}));

describe('useDeleteModal onDeleteConfirm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDeleteModalData = { ...chapterSelection };
    mockCurrentSelection = { ...chapterSelection };
  });

  it('returns early when deleteModalData is undefined', async () => {
    mockDeleteModalData = undefined;

    const { result } = renderHook(() => useDeleteModal(courseId));

    await act(async () => {
      await result.current.onDeleteConfirm();
    });

    expect(mockHandleDeleteItemSubmit).not.toHaveBeenCalled();
    expect(mockCloseDeleteModal).not.toHaveBeenCalled();
    expect(mockClearSelection).not.toHaveBeenCalled();
  });

  it('closes modal and clears selection on success when currentSelection matches', async () => {
    mockHandleDeleteItemSubmit.mockResolvedValue(true);
    mockCurrentSelection = { currentId: chapterSelection.currentId };

    const { result } = renderHook(() => useDeleteModal(courseId));

    await act(async () => {
      await result.current.onDeleteConfirm();
    });

    expect(mockHandleDeleteItemSubmit).toHaveBeenCalledWith(chapterSelection);
    expect(mockCloseDeleteModal).toHaveBeenCalledTimes(1);
    expect(mockClearSelection).toHaveBeenCalledTimes(1);
  });

  it('closes modal but does NOT clear selection when currentSelection differs or is undefined', async () => {
    mockHandleDeleteItemSubmit.mockResolvedValue(true);

    // Case A: different currentId
    mockCurrentSelection = { currentId: 'some-other-item' };
    const { result } = renderHook(() => useDeleteModal(courseId));
    await act(async () => {
      await result.current.onDeleteConfirm();
    });
    expect(mockCloseDeleteModal).toHaveBeenCalledTimes(1);
    expect(mockClearSelection).not.toHaveBeenCalled();

    // Case B: undefined currentSelection
    mockCurrentSelection = undefined;
    await act(async () => {
      await result.current.onDeleteConfirm();
    });
    expect(mockCloseDeleteModal).toHaveBeenCalledTimes(2);
    expect(mockClearSelection).not.toHaveBeenCalled();
  });
});
