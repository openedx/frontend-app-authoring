import { QueryClient } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import { initializeMocks, makeQueryClientWrapper } from '@src/testUtils';

import { emptyCard, useGameState } from './useGameState';

describe('emptyCard', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  // Card ids key image uploads and validation errors to a card, so two cards
  // must never share one, however close together they are created.
  it('gives two cards created in the same instant different ids', () => {
    jest.spyOn(Date, 'now').mockReturnValue(1700000000000);
    jest.spyOn(Math, 'random').mockReturnValue(0.5);
    expect(emptyCard().id).not.toEqual(emptyCard().id);
  });
});

// `useGameState` uses React Query, so rendering it bare needs a client. A new
// one per call, like a fresh page load, with no retries (as testUtils does).
// A null block means no fetch, so the hook starts from its initial state.
const renderGameState = () =>
  renderHook(() => useGameState(null), {
    wrapper: makeQueryClientWrapper(new QueryClient({ defaultOptions: { queries: { retry: false } } })),
  });

describe('useGameState', () => {
  beforeEach(() => {
    initializeMocks();
  });

  // The save path reads the state straight after awaiting an upload, before
  // React has re-rendered. There is one copy of the state and it is current.
  it('exposes the latest state synchronously after an action', () => {
    const { result } = renderGameState();
    const { actions } = result.current;
    const before = actions.getLatestState().list.length;
    act(() => {
      actions.addCard();
      // Still inside act: React has not re-rendered yet.
      expect(actions.getLatestState().list).toHaveLength(before + 1);
    });
  });

  // One store, not a rendered copy plus a synchronous mirror: after a change
  // the rendered state and the synchronous read are the same object.
  it('renders the same state object it exposes synchronously', () => {
    const { result } = renderGameState();
    act(() => {
      result.current.actions.addCard();
    });
    expect(result.current.state).toBe(result.current.actions.getLatestState());
  });
});
