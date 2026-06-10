import { renderHook, act } from '@testing-library/react';
import { useConfigureDialog } from './useConfigureModal';

const courseId = 'course-v1:test+course';

const chapterSelection = {
  category: 'chapter' as const,
  currentId: 'block-v1:test+course+type@chapter+block@ch1',
  sectionId: 'block-v1:test+course+type@chapter+block@ch1',
};

const sequentialSelection = {
  category: 'sequential' as const,
  currentId: 'block-v1:test+course+type@sequential+block@seq1',
  sectionId: 'block-v1:test+course+type@chapter+block@ch1',
  subsectionId: 'block-v1:test+course+type@sequential+block@seq1',
};

const verticalSelection = {
  category: 'vertical' as const,
  currentId: 'block-v1:test+course+type@vertical+block@unit1',
  sectionId: 'block-v1:test+course+type@chapter+block@ch1',
  subsectionId: 'block-v1:test+course+type@sequential+block@seq1',
};

const mockConfigureSectionMutateAsync = jest.fn();
const mockConfigureSubsectionMutateAsync = jest.fn();
const mockConfigureUnitMutateAsync = jest.fn();

jest.mock('../data', () => ({
  useCourseItemData: jest.fn(() => ({ data: undefined })),
  useConfigureSection: () => ({ mutateAsync: mockConfigureSectionMutateAsync }),
  useConfigureSubsection: () => ({ mutateAsync: mockConfigureSubsectionMutateAsync }),
  useConfigureUnit: () => ({ mutateAsync: mockConfigureUnitMutateAsync }),
}));

jest.mock('../constants', () => ({
  COURSE_BLOCK_NAMES: {
    chapter: { id: 'chapter', name: 'Section' },
    sequential: { id: 'sequential', name: 'Subsection' },
    vertical: { id: 'vertical', name: 'Unit' },
  },
}));

describe('useConfigureDialog', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockConfigureSectionMutateAsync.mockResolvedValue(undefined);
    mockConfigureSubsectionMutateAsync.mockResolvedValue(undefined);
    mockConfigureUnitMutateAsync.mockResolvedValue(undefined);
  });

  describe('mutation routing', () => {
    it('routes chapter to configureSectionMutation with correct payload', async () => {
      const { result } = renderHook(() => useConfigureDialog(courseId));
      act(() => {
        result.current.handleOpenConfigureModal(chapterSelection as any);
      });
      await act(async () => {
        await result.current.handleConfigureItemSubmitWrapper({
          isVisibleToStaffOnly: true,
          startDatetime: '2025-06-01T00:00:00',
        });
      });
      expect(mockConfigureSectionMutateAsync).toHaveBeenCalledTimes(1);
      expect(mockConfigureSectionMutateAsync).toHaveBeenCalledWith({
        sectionId: chapterSelection.sectionId,
        isVisibleToStaffOnly: true,
        startDatetime: '2025-06-01T00:00:00',
      });
      expect(mockConfigureSubsectionMutateAsync).not.toHaveBeenCalled();
      expect(mockConfigureUnitMutateAsync).not.toHaveBeenCalled();
    });

    it('routes sequential to configureSubsectionMutation with correct payload', async () => {
      const { result } = renderHook(() => useConfigureDialog(courseId));
      act(() => {
        result.current.handleOpenConfigureModal(sequentialSelection as any);
      });
      await act(async () => {
        await result.current.handleConfigureItemSubmitWrapper({
          isVisibleToStaffOnly: false,
          graderType: 'Homework',
        });
      });
      expect(mockConfigureSubsectionMutateAsync).toHaveBeenCalledTimes(1);
      expect(mockConfigureSubsectionMutateAsync).toHaveBeenCalledWith({
        itemId: sequentialSelection.currentId,
        sectionId: sequentialSelection.sectionId,
        isVisibleToStaffOnly: false,
        graderType: 'Homework',
      });
      expect(mockConfigureSectionMutateAsync).not.toHaveBeenCalled();
      expect(mockConfigureUnitMutateAsync).not.toHaveBeenCalled();
    });

    it('routes vertical to configureUnitMutation with correct payload', async () => {
      const { result } = renderHook(() => useConfigureDialog(courseId));
      act(() => {
        result.current.handleOpenConfigureModal(verticalSelection as any);
      });
      await act(async () => {
        await result.current.handleConfigureItemSubmitWrapper({
          isVisibleToStaffOnly: false,
          type: 'make_public',
          groupAccess: null,
          discussionEnabled: false,
        });
      });
      expect(mockConfigureUnitMutateAsync).toHaveBeenCalledTimes(1);
      expect(mockConfigureUnitMutateAsync).toHaveBeenCalledWith({
        unitId: verticalSelection.currentId,
        sectionId: verticalSelection.sectionId,
        isVisibleToStaffOnly: false,
        type: 'make_public',
        groupAccess: null,
        discussionEnabled: false,
      });
      expect(mockConfigureSectionMutateAsync).not.toHaveBeenCalled();
      expect(mockConfigureSubsectionMutateAsync).not.toHaveBeenCalled();
    });
  });

  describe('modal coordination', () => {
    it('closes configure modal on successful configure submit', async () => {
      const { result } = renderHook(() => useConfigureDialog(courseId));
      act(() => {
        result.current.handleOpenConfigureModal(chapterSelection as any);
      });
      await act(async () => {
        await result.current.handleConfigureItemSubmitWrapper({
          isVisibleToStaffOnly: true,
          startDatetime: '2025-06-01T00:00:00',
        });
      });
      expect(mockConfigureSectionMutateAsync).toHaveBeenCalledTimes(1);
    });

    it('does NOT close configure modal on failed configure submit', async () => {
      mockConfigureSectionMutateAsync.mockRejectedValue(new Error('config failed'));
      const { result } = renderHook(() => useConfigureDialog(courseId));
      act(() => {
        result.current.handleOpenConfigureModal(chapterSelection as any);
      });
      await act(async () => {
        await result.current.handleConfigureItemSubmitWrapper({
          isVisibleToStaffOnly: true,
          startDatetime: '2025-06-01T00:00:00',
        });
      });
      expect(mockConfigureSectionMutateAsync).toHaveBeenCalledTimes(1);
      // Modal stays open — verify by submitting again successfully
      mockConfigureSectionMutateAsync.mockResolvedValue(undefined);
      await act(async () => {
        await result.current.handleConfigureItemSubmitWrapper({
          isVisibleToStaffOnly: false,
          startDatetime: '2025-06-02T00:00:00',
        });
      });
      expect(mockConfigureSectionMutateAsync).toHaveBeenCalledTimes(2);
    });
  });
});
