import { renderHook, act } from '@testing-library/react';
import { useConfigureDialog } from './useConfigureModal';

const courseId = 'course-v1:test+course';
const chapterSelection = {
  category: 'chapter' as const,
  currentId: 'block-v1:test+course+type@chapter+block@ch1',
  sectionId: 'block-v1:test+course+type@chapter+block@ch1',
};

const mockHandleConfigureItemSubmit = jest.fn();

jest.mock('../data', () => ({
  useCourseItemData: jest.fn(() => ({ data: undefined })),
}));

jest.mock('./useOutlineActions', () => ({
  useOutlineConfigureAction: () => ({
    handleConfigureItemSubmit: mockHandleConfigureItemSubmit,
  }),
}));

jest.mock('../constants', () => ({
  COURSE_BLOCK_NAMES: {
    chapter: { id: 'chapter', name: 'Section' },
    sequential: { id: 'sequential', name: 'Subsection' },
    vertical: { id: 'vertical', name: 'Unit' },
  },
}));

describe('useConfigureDialog handleConfigureItemSubmitWrapper', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('closes modal immediately when configureModalData is undefined (defensive)', async () => {
    const { result } = renderHook(() => useConfigureDialog(courseId));

    // Without opening the modal, submit should early-return
    await act(async () => {
      await result.current.handleConfigureItemSubmitWrapper({ isVisibleToStaffOnly: true });
    });

    expect(mockHandleConfigureItemSubmit).not.toHaveBeenCalled();
    expect(result.current.isConfigureModalOpen).toBe(false);
  });

  it('closes configure modal on successful configure submit', async () => {
    mockHandleConfigureItemSubmit.mockResolvedValue(true);

    const { result } = renderHook(() => useConfigureDialog(courseId));

    act(() => {
      result.current.handleOpenConfigureModal(chapterSelection);
    });

    await act(async () => {
      await result.current.handleConfigureItemSubmitWrapper({
        isVisibleToStaffOnly: true,
        startDatetime: '2025-06-01T00:00:00',
      });
    });

    expect(mockHandleConfigureItemSubmit).toHaveBeenCalledWith({
      category: 'chapter',
      sectionId: chapterSelection.sectionId,
      isVisibleToStaffOnly: true,
      startDatetime: '2025-06-01T00:00:00',
    });
  });

  it('does NOT close configure modal on failed configure submit', async () => {
    mockHandleConfigureItemSubmit.mockResolvedValue(false);

    const { result } = renderHook(() => useConfigureDialog(courseId));

    act(() => {
      result.current.handleOpenConfigureModal(chapterSelection);
    });

    await act(async () => {
      await result.current.handleConfigureItemSubmitWrapper({
        isVisibleToStaffOnly: true,
        startDatetime: '2025-06-01T00:00:00',
      });
    });

    expect(mockHandleConfigureItemSubmit).toHaveBeenCalledTimes(1);

    // configureModalData should remain set (modal stayed open)
    mockHandleConfigureItemSubmit.mockResolvedValue(true);

    await act(async () => {
      await result.current.handleConfigureItemSubmitWrapper({
        isVisibleToStaffOnly: false,
        startDatetime: '2025-06-02T00:00:00',
      });
    });

    expect(mockHandleConfigureItemSubmit).toHaveBeenCalledTimes(2);
  });
});
