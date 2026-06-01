import { renderHook, act, render } from '@testing-library/react';
import { useOutlineModals } from './useOutlineModals';

// ---------------------------------------------------------------------------
// Helpers: capture OutlineModals props so we can invoke onDeleteConfirm
// ---------------------------------------------------------------------------
let capturedOutlineModalsProps: Record<string, any> = {};

jest.mock('../OutlineModals', () => {
  const MockModals = (props: any) => {
    capturedOutlineModalsProps = { ...props };
    return <div data-testid="outline-modals-mock" />;
  };
  MockModals.displayName = 'OutlineModals';
  return MockModals;
});

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------
const courseId = 'course-v1:test+course';
const chapterSelection = {
  category: 'chapter' as const,
  currentId: 'block-v1:test+course+type@chapter+block@ch1',
  sectionId: 'block-v1:test+course+type@chapter+block@ch1',
};

// ---------------------------------------------------------------------------
// Mocks — jest.mock is hoisted above imports
// ---------------------------------------------------------------------------
const mockCloseDeleteModal = jest.fn();
const mockClearSelection = jest.fn();
const mockOpenDeleteModal = jest.fn();
const mockHandleDeleteItemSubmit = jest.fn();
const mockHandleConfigureItemSubmit = jest.fn();

// Context mocks (mutable so each test can override values)
let mockDeleteModalData: any = undefined;
let mockCurrentSelection: any = undefined;
let mockIsDeleteModalOpen = false;
let mockEnableProctoredExams = false;
let mockEnableTimedExams = false;
let mockStatusBarData: any = { isSelfPaced: false };

jest.mock('../CourseOutlineContext', () => ({
  useCourseOutlineContext: () => ({
    deleteModalData: mockDeleteModalData,
    isDeleteModalOpen: mockIsDeleteModalOpen,
    closeDeleteModal: mockCloseDeleteModal,
    openDeleteModal: mockOpenDeleteModal,
    currentSelection: mockCurrentSelection,
    clearSelection: mockClearSelection,
    enableProctoredExams: mockEnableProctoredExams,
    enableTimedExams: mockEnableTimedExams,
    statusBarData: mockStatusBarData,
  }),
}));

jest.mock('@src/CourseAuthoringContext', () => ({
  useCourseAuthoringContext: () => ({
    courseId,
    isUnlinkModalOpen: false,
    currentUnlinkModalData: undefined,
    closeUnlinkModal: jest.fn(),
  }),
}));

jest.mock('./useOutlineActions', () => ({
  useOutlineActions: () => ({
    handleDeleteItemSubmit: mockHandleDeleteItemSubmit,
    handleConfigureItemSubmit: mockHandleConfigureItemSubmit,
  }),
}));

jest.mock('../data/apiHooks', () => ({
  useCourseItemData: jest.fn(() => ({ data: undefined })),
  useUpdateCourseSectionHighlights: jest.fn(() => ({ mutate: jest.fn() })),
  useEnableCourseHighlightsEmails: jest.fn(() => ({ mutate: jest.fn() })),
}));

jest.mock('@src/generic/unlink-modal', () => ({
  useUnlinkDownstream: jest.fn(() => ({ mutateAsync: jest.fn() })),
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function renderModalsHook() {
  const hookResult = renderHook(() => useOutlineModals(courseId));
  // Mount the modals JSX so the OutlineModals mock component receives props
  render(hookResult.result.current.modals);
  return hookResult;
}

function getOnDeleteConfirm(): () => Promise<void> {
  return capturedOutlineModalsProps.onDeleteConfirm as () => Promise<void>;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('useOutlineModals onDeleteConfirm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mutable mock state to defaults
    mockDeleteModalData = { ...chapterSelection };
    mockCurrentSelection = { ...chapterSelection };
    mockIsDeleteModalOpen = true;
    mockEnableProctoredExams = false;
    mockEnableTimedExams = false;
    mockStatusBarData = { isSelfPaced: false };
    capturedOutlineModalsProps = {};
  });

  // ── Branch 1: no deleteModalData => early return ────────────────────────
  it('returns early and does nothing when deleteModalData is undefined', async () => {
    mockDeleteModalData = undefined;

    renderModalsHook();
    const onDeleteConfirm = getOnDeleteConfirm();

    await act(async () => {
      await onDeleteConfirm();
    });

    expect(mockHandleDeleteItemSubmit).not.toHaveBeenCalled();
    expect(mockCloseDeleteModal).not.toHaveBeenCalled();
    expect(mockClearSelection).not.toHaveBeenCalled();
  });

  // ── Branch 2: successful delete + currentSelection matches => close + clear
  it('closes modal and clears selection on success when currentSelection matches', async () => {
    mockHandleDeleteItemSubmit.mockResolvedValue(true);
    mockCurrentSelection = { currentId: chapterSelection.currentId };

    renderModalsHook();
    const onDeleteConfirm = getOnDeleteConfirm();

    await act(async () => {
      await onDeleteConfirm();
    });

    expect(mockHandleDeleteItemSubmit).toHaveBeenCalledWith(chapterSelection);
    expect(mockCloseDeleteModal).toHaveBeenCalledTimes(1);
    expect(mockClearSelection).toHaveBeenCalledTimes(1);
  });

  // ── Branch 3: successful delete + currentSelection mismatch => close, no clear
  it('closes modal but does NOT clear selection on success when currentSelection differs', async () => {
    mockHandleDeleteItemSubmit.mockResolvedValue(true);
    // currentSelection points to a different item
    mockCurrentSelection = { currentId: 'some-other-item' };

    renderModalsHook();
    const onDeleteConfirm = getOnDeleteConfirm();

    await act(async () => {
      await onDeleteConfirm();
    });

    expect(mockHandleDeleteItemSubmit).toHaveBeenCalledWith(chapterSelection);
    expect(mockCloseDeleteModal).toHaveBeenCalledTimes(1);
    expect(mockClearSelection).not.toHaveBeenCalled();
  });

  // ── Branch 4: failed delete => do not close, do not clear
  it('does NOT close modal or clear selection on mutation failure', async () => {
    mockHandleDeleteItemSubmit.mockResolvedValue(false);

    renderModalsHook();
    const onDeleteConfirm = getOnDeleteConfirm();

    await act(async () => {
      await onDeleteConfirm();
    });

    expect(mockHandleDeleteItemSubmit).toHaveBeenCalledWith(chapterSelection);
    expect(mockCloseDeleteModal).not.toHaveBeenCalled();
    expect(mockClearSelection).not.toHaveBeenCalled();
  });

  // ── currentSelection undefined (no sidebar selected) => close, no clear
  it('closes modal but does NOT clear selection when currentSelection is undefined', async () => {
    mockHandleDeleteItemSubmit.mockResolvedValue(true);
    mockCurrentSelection = undefined;

    renderModalsHook();
    const onDeleteConfirm = getOnDeleteConfirm();

    await act(async () => {
      await onDeleteConfirm();
    });

    expect(mockHandleDeleteItemSubmit).toHaveBeenCalledWith(chapterSelection);
    expect(mockCloseDeleteModal).toHaveBeenCalledTimes(1);
    expect(mockClearSelection).not.toHaveBeenCalled();
  });
});
