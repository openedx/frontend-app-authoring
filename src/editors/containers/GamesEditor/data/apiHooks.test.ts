import { renderHook } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { initializeMocks, makeQueryClientWrapper } from '@src/testUtils';

import { useSaveGameSettings, useUploadGameImage } from './apiHooks';

// The editor only mounts for a block, but the hooks must still fail cleanly
// (as a request would) rather than throw on a missing block.
describe('game handler hooks without a block', () => {
  const wrapper = () => makeQueryClientWrapper(new QueryClient({ defaultOptions: { mutations: { retry: false } } }));

  beforeEach(() => {
    initializeMocks();
  });

  it('rejects a save', async () => {
    const { result } = renderHook(() => useSaveGameSettings(null), { wrapper: wrapper() });
    await expect(result.current.mutateAsync({
      gameType: 'matching',
      isShuffled: true,
      hasTimer: true,
      cards: [],
      title: null,
    })).rejects.toThrow('No block id');
  });

  it('rejects an upload', async () => {
    const { result } = renderHook(() => useUploadGameImage(null), { wrapper: wrapper() });
    await expect(result.current.mutateAsync(new File(['x'], 'x.png'))).rejects.toThrow('No block id');
  });
});
