import React from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';

import type { BlockRef, SaveArgs } from '../types';
import * as api from './api';

/**
 * Every request here goes out the moment it is asked for, online or not.
 *
 * React Query's default (`'online'`) holds a request while the browser is
 * offline and sends it when the connection returns, even after the component
 * has unmounted. For an editor that is unsafe: an author who clicks Save while
 * offline, then closes the editor and discards the changes, would have them
 * saved anyway on reconnect, behind their back. A held load would sit on its
 * spinner with no error and no Retry. With `'always'` an offline request fails
 * at once, as a plain HTTP call does, and the editor reports it.
 */
const networkMode = 'always' as const;

// Without a block there is nothing to talk to. Unreachable in practice (the
// editor only mounts for a block), and rejects just as the request would.
const noBlock = () => Promise.reject(new Error('No block id'));

/**
 * The block's saved settings, fetched once per editor mount.
 *
 * This is the starting point of a form, not a live view of the server, so the
 * usual React Query conveniences are turned off on purpose:
 *
 * - The key carries a per-mount id and nothing is kept after unmount
 *   (`gcTime: 0`), so opening the same block again always fetches. A cached
 *   response would show the cards from before the last save. The host's PDF
 *   editor keys its handler queries per mount for the same reason.
 * - It never refetches by itself (focus, reconnect, staleness). Fresh data
 *   replaces the card list, which would discard the author's unsaved edits.
 *   The only refetch is the explicit Retry after a failed load.
 * - No automatic retries: a failed load is shown, with that Retry button.
 */
export const useGameSettings = (block: BlockRef | null) => {
  const mountId = React.useId();
  return useQuery({
    queryKey: ['xblockGamesEditor', 'settings', block?.blockId, block?.studioEndpointUrl, mountId],
    queryFn: async () => (await api.getSettings(block as BlockRef)).data,
    enabled: !!block,
    networkMode,
    staleTime: Infinity,
    gcTime: 0,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
};

/** Saves through the block's own `save_settings` handler. */
export const useSaveGameSettings = (block: BlockRef | null) =>
  useMutation({
    mutationFn: (content: SaveArgs) => (block ? api.saveSettings(block, content) : noBlock()),
    networkMode,
  });

/** Uploads one image through the block's `upload_image` handler. */
export const useUploadGameImage = (block: BlockRef | null) =>
  useMutation({
    mutationFn: (file: File) => (block ? api.uploadImage(block, file) : noBlock()),
    networkMode,
  });
