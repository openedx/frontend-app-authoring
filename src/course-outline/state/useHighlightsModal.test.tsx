import { renderHook, act } from '@testing-library/react';
import { useHighlightsModal } from './useHighlightsModal';

const courseId = 'course-v1:test+course';
const mockHighlightsMutate = jest.fn();

jest.mock('../data', () => ({
  useUpdateCourseSectionHighlights: jest.fn(() => ({ mutate: mockHighlightsMutate })),
}));

describe('useHighlightsModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('handleHighlightsFormSubmit calls mutation with filtered truthy values', () => {
    const { result } = renderHook(() => useHighlightsModal(courseId));

    act(() => {
      result.current.handleOpenHighlightsModal({ id: 'block-section-hl' } as any);
    });

    act(() => {
      result.current.handleHighlightsFormSubmit({
        highlight_1: 'Monday highlight',
        highlight_2: '',
        highlight_3: null as any,
        highlight_4: 'Thursday highlight',
        highlight_5: undefined as any,
      });
    });

    expect(mockHighlightsMutate).toHaveBeenCalledWith({
      sectionId: 'block-section-hl',
      highlights: ['Monday highlight', 'Thursday highlight'],
    });
  });

  it('trims whitespace and filters blank strings', () => {
    const { result } = renderHook(() => useHighlightsModal(courseId));

    act(() => {
      result.current.handleOpenHighlightsModal({ id: 'block-sec' } as any);
    });

    act(() => {
      result.current.handleHighlightsFormSubmit({
        highlight_1: 'Alpha',
        highlight_2: '  ',
        highlight_3: 'Gamma',
      } as any);
    });

    expect(mockHighlightsMutate).toHaveBeenCalledWith({
      sectionId: 'block-sec',
      highlights: ['Alpha', 'Gamma'],
    });
  });
});
