import { act, renderHook } from '@testing-library/react';
import { useCourseOutline } from './hooks';

// ---------------------------------------------------------------------------
// Mock state — controllable per-test via beforeEach reassignment
// ---------------------------------------------------------------------------
let mockActionTargetSelection = undefined;
let mockCurrentSelection = undefined;
let mockSelectedContainerState = undefined;

const mockDeleteMutateAsync = jest.fn();
const mockSidebarClearSelection = jest.fn();
const mockContextClearSelection = jest.fn();
const mockCloseDeleteModal = jest.fn();

// ---------------------------------------------------------------------------
// Mocks — jest.mock is hoisted above imports
// ---------------------------------------------------------------------------
jest.mock('@src/CourseAuthoringContext', () => ({
  useCourseAuthoringContext: () => ({
    courseId: 'course-v1:test+course',
    currentUnlinkModalData: undefined,
    closeUnlinkModal: jest.fn(),
  }),
}));

jest.mock('@src/generic/unlink-modal', () => ({
  useUnlinkDownstream: () => ({ mutateAsync: jest.fn() }),
}));

jest.mock('@src/course-outline/outline-sidebar/OutlineSidebarContext', () => ({
  useOutlineSidebarContext: () => ({
    selectedContainerState: mockSelectedContainerState,
    clearSelection: mockSidebarClearSelection,
  }),
}));

jest.mock('./data/apiHooks', () => ({
  useDeleteCourseItem: () => ({ mutateAsync: mockDeleteMutateAsync }),
  useConfigureSection: () => ({ mutate: jest.fn() }),
  useConfigureSubsection: () => ({ mutate: jest.fn() }),
  useConfigureUnit: () => ({ mutate: jest.fn() }),
  usePasteItem: () => ({ mutate: jest.fn() }),
  useUpdateCourseSectionHighlights: () => ({ mutate: jest.fn() }),
  useSetVideoSharingOption: () => ({ mutate: jest.fn() }),
  useEnableCourseHighlightsEmails: () => ({ mutate: jest.fn() }),
  useDismissNotification: () => ({ mutate: jest.fn() }),
  useRestartIndexingOnCourse: () => ({ mutate: jest.fn() }),
}));

jest.mock('./CourseOutlineContext', () => ({
  useCourseOutlineContext: () => ({
    isDeleteModalOpen: false,
    openDeleteModal: jest.fn(),
    closeDeleteModal: mockCloseDeleteModal,
    outlineIndexData: {},
    loadingStatus: {
      outlineIndexIsLoading: false,
      outlineIndexIsDenied: false,
      reIndexLoadingStatus: '',
    },
    statusBarData: {},
    savingStatus: '',
    courseActions: {},
    isCustomRelativeDatesActive: false,
    errors: {},
    handleAddBlock: { mutateAsync: jest.fn() },
    actionTargetSelection: mockActionTargetSelection,
    setActionTargetSelection: jest.fn(),
    courseUsageKey: 'course-key',
    currentSelection: mockCurrentSelection,
    clearSelection: mockContextClearSelection,
  }),
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const subsectionSelection = {
  currentId: 'block-v1:test+course+type@sequential+block@subsec1',
  sectionId: 'block-v1:test+course+type@chapter+block@sec1',
  subsectionId: undefined,
};

function renderOutlineHook() {
  return renderHook(() => useCourseOutline());
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('useCourseOutline handleDeleteItemSubmit', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mutable mock state
    mockActionTargetSelection = undefined;
    mockCurrentSelection = undefined;
    mockSelectedContainerState = undefined;
  });

  it('returns early when actionTargetSelection is undefined', async () => {
    const { result } = renderOutlineHook();

    await act(async () => {
      await result.current.handleDeleteItemSubmit();
    });

    expect(mockDeleteMutateAsync).not.toHaveBeenCalled();
    expect(mockCloseDeleteModal).not.toHaveBeenCalled();
    expect(mockSidebarClearSelection).not.toHaveBeenCalled();
    expect(mockContextClearSelection).not.toHaveBeenCalled();
  });

  describe('successful subsection delete', () => {
    beforeEach(() => {
      mockActionTargetSelection = { ...subsectionSelection };
      mockCurrentSelection = { ...subsectionSelection };
      mockSelectedContainerState = { ...subsectionSelection };
      mockDeleteMutateAsync.mockResolvedValue(undefined);
    });

    it('clears both sidebar and context selection when both match actionTargetSelection', async () => {
      const { result } = renderOutlineHook();

      await act(async () => {
        await result.current.handleDeleteItemSubmit();
      });

      expect(mockDeleteMutateAsync).toHaveBeenCalledWith({
        itemId: subsectionSelection.currentId,
        sectionId: subsectionSelection.sectionId,
      });
      expect(mockCloseDeleteModal).toHaveBeenCalled();
      expect(mockSidebarClearSelection).toHaveBeenCalledTimes(1);
      expect(mockContextClearSelection).toHaveBeenCalledTimes(1);
    });

    it('skips sidebar clearSelection when selectedContainerState does not match', async () => {
      mockSelectedContainerState = { currentId: 'other-item', sectionId: 'other-section' };
      const { result } = renderOutlineHook();

      await act(async () => {
        await result.current.handleDeleteItemSubmit();
      });

      expect(mockDeleteMutateAsync).toHaveBeenCalled();
      expect(mockSidebarClearSelection).not.toHaveBeenCalled();
      expect(mockContextClearSelection).toHaveBeenCalledTimes(1);
    });

    it('skips context clearSelection when currentSelection does not match', async () => {
      mockCurrentSelection = { currentId: 'other-item', sectionId: 'other-section' };
      const { result } = renderOutlineHook();

      await act(async () => {
        await result.current.handleDeleteItemSubmit();
      });

      expect(mockDeleteMutateAsync).toHaveBeenCalled();
      expect(mockSidebarClearSelection).toHaveBeenCalledTimes(1);
      expect(mockContextClearSelection).not.toHaveBeenCalled();
    });

    it('handles chapter delete correctly', async () => {
      const chapterSelection = {
        currentId: 'block-v1:test+course+type@chapter+block@ch1',
        sectionId: 'block-v1:test+course+type@chapter+block@ch1',
      };
      mockActionTargetSelection = { ...chapterSelection };
      mockCurrentSelection = { ...chapterSelection };
      mockSelectedContainerState = { ...chapterSelection };

      const { result } = renderOutlineHook();

      await act(async () => {
        await result.current.handleDeleteItemSubmit();
      });

      expect(mockDeleteMutateAsync).toHaveBeenCalledWith({ itemId: chapterSelection.currentId });
      expect(mockCloseDeleteModal).toHaveBeenCalled();
      expect(mockSidebarClearSelection).toHaveBeenCalledTimes(1);
      expect(mockContextClearSelection).toHaveBeenCalledTimes(1);
    });
  });

  describe('mutation failure', () => {
    beforeEach(() => {
      mockActionTargetSelection = { ...subsectionSelection };
      mockCurrentSelection = { ...subsectionSelection };
      mockSelectedContainerState = { ...subsectionSelection };
      mockDeleteMutateAsync.mockRejectedValue(new Error('delete failed'));
    });

    it('does not clear selections on mutation failure', async () => {
      const { result } = renderOutlineHook();

      await act(async () => {
        // Error is caught internally — no throw expected
        await result.current.handleDeleteItemSubmit();
      });

      expect(mockDeleteMutateAsync).toHaveBeenCalled();
      expect(mockCloseDeleteModal).not.toHaveBeenCalled();
      expect(mockSidebarClearSelection).not.toHaveBeenCalled();
      expect(mockContextClearSelection).not.toHaveBeenCalled();
    });
  });
});
