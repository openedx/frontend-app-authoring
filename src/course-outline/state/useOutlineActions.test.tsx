import { renderHook } from '@testing-library/react';
import type { OutlineActionSelection } from '@src/data/types';
import type { ConfigureItemPayload } from '../data';

import { useOutlineDeleteAction, useOutlineConfigureAction } from './useOutlineActions';

const courseId = 'course-v1:test+course';

const mockDeleteMutateAsync = jest.fn();
const mockConfigureSectionMutateAsync = jest.fn();
const mockConfigureSubsectionMutateAsync = jest.fn();
const mockConfigureUnitMutateAsync = jest.fn();

jest.mock('../data', () => ({
  useDeleteCourseItem: () => ({ mutateAsync: mockDeleteMutateAsync }),
  useConfigureSection: () => ({ mutateAsync: mockConfigureSectionMutateAsync }),
  useConfigureSubsection: () => ({ mutateAsync: mockConfigureSubsectionMutateAsync }),
  useConfigureUnit: () => ({ mutateAsync: mockConfigureUnitMutateAsync }),
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

const chapterConfig: ConfigureItemPayload = {
  category: 'chapter',
  sectionId: 'block-v1:test+course+type@chapter+block@ch1',
  isVisibleToStaffOnly: true,
  startDatetime: '2025-06-01T00:00:00',
};

const sequentialConfig: ConfigureItemPayload = {
  category: 'sequential',
  itemId: 'block-v1:test+course+type@sequential+block@seq1',
  sectionId: 'block-v1:test+course+type@chapter+block@ch1',
  isVisibleToStaffOnly: false,
  graderType: 'Homework',
};

const unitConfig: ConfigureItemPayload = {
  category: 'vertical',
  unitId: 'block-v1:test+course+type@vertical+block@unit1',
  sectionId: 'block-v1:test+course+type@chapter+block@ch1',
  isVisibleToStaffOnly: false,
  type: 'make_public',
  groupAccess: null,
  discussionEnabled: false,
};

// ===== useOutlineDeleteAction =============================================

describe('useOutlineDeleteAction', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDeleteMutateAsync.mockResolvedValue(undefined);
  });

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
  ])('routes category %s to deleteMutation.mutateAsync with correct payload', async (_, selection, expectedPayload) => {
    const { result } = renderHook(() => useOutlineDeleteAction(courseId));
    const ok = await result.current.handleDeleteItemSubmit(selection);
    expect(ok).toBe(true);
    expect(mockDeleteMutateAsync).toHaveBeenCalledTimes(1);
    expect(mockDeleteMutateAsync).toHaveBeenCalledWith(expectedPayload);
  });

  it('returns false for unrecognized category', async () => {
    const { result } = renderHook(() => useOutlineDeleteAction(courseId));
    const ok = await result.current.handleDeleteItemSubmit({ category: 'unknown' } as any);
    expect(ok).toBe(false);
    expect(mockDeleteMutateAsync).not.toHaveBeenCalled();
  });

  it('returns false when mutation throws', async () => {
    mockDeleteMutateAsync.mockRejectedValue(new Error('delete failed'));
    const { result } = renderHook(() => useOutlineDeleteAction(courseId));
    const ok = await result.current.handleDeleteItemSubmit(chapterSelection);
    expect(ok).toBe(false);
    expect(mockDeleteMutateAsync).toHaveBeenCalledTimes(1);
  });
});

// ===== useOutlineConfigureAction ==========================================

describe('useOutlineConfigureAction', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockConfigureSectionMutateAsync.mockResolvedValue(undefined);
    mockConfigureSubsectionMutateAsync.mockResolvedValue(undefined);
    mockConfigureUnitMutateAsync.mockResolvedValue(undefined);
  });

  it.each([
    ['chapter', chapterConfig, {
      sectionId: chapterConfig.sectionId,
      isVisibleToStaffOnly: true,
      startDatetime: '2025-06-01T00:00:00',
    }],
    ['sequential', sequentialConfig, {
      itemId: sequentialConfig.itemId,
      sectionId: sequentialConfig.sectionId,
      isVisibleToStaffOnly: false,
      graderType: 'Homework',
    }],
    ['vertical', unitConfig, {
      unitId: unitConfig.unitId,
      sectionId: unitConfig.sectionId,
      isVisibleToStaffOnly: false,
      type: 'make_public',
      groupAccess: null,
      discussionEnabled: false,
    }],
  ])(
    'routes category %s to correct configure mutation with payload minus category',
    async (_, payload, expectedRest) => {
      const { result } = renderHook(() => useOutlineConfigureAction(courseId));
      const ok = await result.current.handleConfigureItemSubmit(payload);
      expect(ok).toBe(true);
      // Only the matching mutation was called
      const mockMap: Record<string, jest.Mock> = {
        chapter: mockConfigureSectionMutateAsync,
        sequential: mockConfigureSubsectionMutateAsync,
        vertical: mockConfigureUnitMutateAsync,
      };
      expect(mockMap[payload.category]).toHaveBeenCalledTimes(1);
      expect(mockMap[payload.category]).toHaveBeenCalledWith(expectedRest);
      // Other mutations untouched
      for (const [cat, mock] of Object.entries(mockMap)) {
        if (cat !== payload.category) {
          expect(mock).not.toHaveBeenCalled();
        }
      }
    },
  );

  it('returns false for null payload', async () => {
    const { result } = renderHook(() => useOutlineConfigureAction(courseId));
    const ok = await result.current.handleConfigureItemSubmit(null as any);
    expect(ok).toBe(false);
    expect(mockConfigureSectionMutateAsync).not.toHaveBeenCalled();
    expect(mockConfigureSubsectionMutateAsync).not.toHaveBeenCalled();
    expect(mockConfigureUnitMutateAsync).not.toHaveBeenCalled();
  });

  it('returns false for unknown configure category', async () => {
    const { result } = renderHook(() => useOutlineConfigureAction(courseId));
    const ok = await result.current.handleConfigureItemSubmit({ category: 'unknown' } as any);
    expect(ok).toBe(false);
    expect(mockConfigureSectionMutateAsync).not.toHaveBeenCalled();
    expect(mockConfigureSubsectionMutateAsync).not.toHaveBeenCalled();
    expect(mockConfigureUnitMutateAsync).not.toHaveBeenCalled();
  });

  it('returns false when mutation throws', async () => {
    mockConfigureSectionMutateAsync.mockRejectedValue(new Error('config failed'));
    const { result } = renderHook(() => useOutlineConfigureAction(courseId));
    const ok = await result.current.handleConfigureItemSubmit(chapterConfig);
    expect(ok).toBe(false);
    expect(mockConfigureSectionMutateAsync).toHaveBeenCalledTimes(1);
  });
});
