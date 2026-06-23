import { act, renderHook, waitFor } from '@testing-library/react';
import { useFieldDraft } from './useFieldDraft';

describe('useFieldDraft', () => {
  it('returns the server value when there is no override', () => {
    const commit = jest.fn();
    const { result, rerender } = renderHook(
      ({ sv }) => useFieldDraft(sv, commit, 0),
      { initialProps: { sv: { a: 1 } } },
    );

    expect(result.current[0]).toEqual({ a: 1 });

    // External change with no pending edit is reflected immediately, no commit.
    rerender({ sv: { a: 2 } });
    expect(result.current[0]).toEqual({ a: 2 });
    expect(commit).not.toHaveBeenCalled();
  });

  it('shows the override immediately and commits the merged value after the delay', async () => {
    const commit = jest.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => useFieldDraft({ a: 1, b: 2 }, commit, 20));

    act(() => result.current[1]({ a: 5 }));
    expect(result.current[0]).toEqual({ a: 5, b: 2 });

    await waitFor(() => expect(commit).toHaveBeenCalledWith({ a: 5, b: 2 }));
  });

  it('does not clobber a pending edit when the server value changes', () => {
    const commit = jest.fn().mockResolvedValue(undefined);
    const { result, rerender } = renderHook(
      ({ sv }) => useFieldDraft(sv, commit, 1000),
      { initialProps: { sv: { a: 1 } } },
    );

    act(() => result.current[1]({ a: 5 }));
    // Background refetch lands a different value while the edit is in flight.
    rerender({ sv: { a: 9 } });

    expect(result.current[0]).toEqual({ a: 5 });
  });

  it('retires the override once the server reflects later external changes', async () => {
    const commit = jest.fn().mockResolvedValue(undefined);
    const { result, rerender } = renderHook(
      ({ sv }) => useFieldDraft(sv, commit, 10),
      { initialProps: { sv: { a: 1 } } },
    );

    act(() => result.current[1]({ a: 5 }));
    await waitFor(() => expect(commit).toHaveBeenCalledWith({ a: 5 }));

    // Server catches up to our committed value -> override retired.
    rerender({ sv: { a: 5 } });
    // A subsequent external change is now reflected (override is gone).
    rerender({ sv: { a: 7 } });
    await waitFor(() => expect(result.current[0]).toEqual({ a: 7 }));
  });

  it('reverts the override when the commit fails', async () => {
    const commit = jest.fn().mockRejectedValue(new Error('save failed'));
    const { result } = renderHook(() => useFieldDraft({ a: 1 }, commit, 10));

    act(() => result.current[1]({ a: 5 }));
    expect(result.current[0]).toEqual({ a: 5 });

    await waitFor(() => expect(result.current[0]).toEqual({ a: 1 }));
  });
});
