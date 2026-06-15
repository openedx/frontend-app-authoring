import { renderHook } from '@testing-library/react';
import { RequestStatus } from '@src/data/constants';
import { useCourseOutlineReindexStatus } from './outlineStatusHooks';

const mockUseMutationState = jest.fn();

jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  useMutationState: (...args: any[]) => mockUseMutationState(...args),
}));

jest.mock('../utils/getErrorDetails', () => ({
  getErrorDetails: jest.fn((error: any) => ({
    type: 'serverError',
    data: error?.message || 'unknown error',
    dismissible: true,
  })),
}));

describe('useCourseOutlineReindexStatus', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns IN_PROGRESS when a new pending mutation exists alongside a prior success', () => {
    const oldSubmittedAt = Date.now() - 5000;
    mockUseMutationState.mockReturnValue([
      { status: 'success', submittedAt: oldSubmittedAt },
      { status: 'pending', submittedAt: Date.now() },
    ]);
    const { result } = renderHook(() => useCourseOutlineReindexStatus('course-v1:test'));
    expect(result.current.reindexLoadingStatus).toBe(RequestStatus.IN_PROGRESS);
    expect(result.current.reindexError).toBeNull();
  });

  it('returns IN_PROGRESS when a new pending mutation exists alongside a prior failure', () => {
    const oldSubmittedAt = Date.now() - 5000;
    mockUseMutationState.mockReturnValue([
      { status: 'error', submittedAt: oldSubmittedAt, error: new Error('old failure') },
      { status: 'pending', submittedAt: Date.now() },
    ]);
    const { result } = renderHook(() => useCourseOutlineReindexStatus('course-v1:test'));
    expect(result.current.reindexLoadingStatus).toBe(RequestStatus.IN_PROGRESS);
    expect(result.current.reindexError).toBeNull();
  });

  // --- Pending takes priority over both success and error in same batch ---

  it('returns IN_PROGRESS when multiple mutations exist including pending', () => {
    const submittedAt = Date.now();
    mockUseMutationState.mockReturnValue([
      { status: 'error', submittedAt: submittedAt - 10000, error: new Error('old') },
      { status: 'success', submittedAt: submittedAt - 5000 },
      { status: 'pending', submittedAt },
    ]);
    const { result } = renderHook(() => useCourseOutlineReindexStatus('course-v1:test'));
    expect(result.current.reindexLoadingStatus).toBe(RequestStatus.IN_PROGRESS);
    expect(result.current.reindexError).toBeNull();
  });
});
