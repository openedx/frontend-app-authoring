import { renderHook } from '@testing-library/react-hooks';
import { useSelector } from 'react-redux';
import { useSequenceNavigationMetadata } from './hooks';
import { getCourseSectionVertical, getSequenceIds } from '../data/selectors';

import { useModel } from '../../generic/model-store';

jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
}));

jest.mock('../../generic/model-store', () => ({
  useModel: jest.fn(),
}));

jest.mock('@openedx/paragon', () => ({
  useWindowSize: jest.fn(),
}));

describe('useSequenceNavigationMetadata', () => {
  const mockCourseId = 'course-v1:example';
  const mockCurrentSequenceId = 'sequence-1';
  const mockCurrentUnitId = 'unit-1';
  const mockNextUrl = '/next-url';
  const mockPrevUrl = '/prev-url';
  const mockSequenceIds = ['sequence-1', 'sequence-2'];
  const mockSequence = {
    unitIds: ['unit-1', 'unit-2'],
  };

  beforeEach(() => {
    useSelector.mockImplementation((selector) => {
      if (selector === getCourseSectionVertical) { return { nextUrl: mockNextUrl, prevUrl: mockPrevUrl }; }
      if (selector === getSequenceIds) { return mockSequenceIds; }
      return null;
    });
    useModel.mockReturnValue(mockSequence);
  });

  it('sets isLastUnit to true if no nextUrl is provided', () => {
    useSelector.mockReturnValueOnce({ nextUrl: null, prevUrl: mockPrevUrl });
    const { result } = renderHook(
      () => useSequenceNavigationMetadata(mockCourseId, mockCurrentSequenceId, mockCurrentUnitId),
    );

    expect(result.current.isLastUnit).toBe(true);
  });

  it('sets isFirstUnit to true if no prevUrl is provided', () => {
    useSelector.mockReturnValueOnce({ nextUrl: mockNextUrl, prevUrl: null });
    const { result } = renderHook(
      () => useSequenceNavigationMetadata(mockCourseId, mockCurrentSequenceId, mockCurrentUnitId),
    );

    expect(result.current.isFirstUnit).toBe(true);
  });
});
