import { useIntl } from '@edx/frontend-platform/i18n';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useContext, useEffect } from 'react';

import {
  CLIPBOARD_STATUS,
  STRUCTURAL_XBLOCK_TYPES,
  STUDIO_CLIPBOARD_CHANNEL,
} from '@src/constants';

import { getClipboard, updateClipboard } from '../../data/api';
import { ToastContext } from '../../toast-context';
import messages from './messages';

const CLIPBOARD_QUERY_KEY = ['clipboard'];

// Global, shared broadcast channel for the clipboard. Disabled by default in test environment where it's not defined.
let clipboardBroadcastChannel = (
  typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel(STUDIO_CLIPBOARD_CHANNEL) : null
);
/** To allow mocking the broadcast channel for testing */
// eslint-disable-next-line
export const _testingOverrideBroadcastChannel = (x: BroadcastChannel) => { clipboardBroadcastChannel = x; };

/**
 * Custom React hook for managing clipboard functionality.
 *
 * @param canEdit - Flag indicating whether the clipboard is editable.
 * @returns - An object containing state variables and functions related to clipboard functionality.
 * @property showPasteUnit - Flag indicating whether the "Paste Unit" button should be visible.
 * @property showPasteSubsection - Flag indicating whether the "Paste Subsection" button should be visible.
 * @property showPasteSection - Flag indicating whether the "Paste Subsection" button should be visible.
 * @property showPasteXBlock - Flag indicating whether the "Paste XBlock" button should be visible.
 * @property sharedClipboardData - The shared clipboard data object.
 * @property copyToClipboard - Function to copy the current selection to the clipboard.
 */
const useClipboard = (canEdit: boolean = true) => {
  const intl = useIntl();
  const { data: clipboardData } = useQuery({
    queryKey: CLIPBOARD_QUERY_KEY,
    queryFn: getClipboard,
    refetchInterval: (query) => (query.state.data?.content?.status === CLIPBOARD_STATUS.loading ? 1000 : false),
  });
  const { showToast } = useContext(ToastContext);

  const queryClient = useQueryClient();

  const copyToClipboard = useCallback(async (usageKey: string) => {
    // This code is synchronous for now, but it could be made asynchronous in the future.
    // In that case, the `done` message should be shown after the asynchronous operation completes.
    showToast(intl.formatMessage(messages.copying));
    let newData;
    try {
      newData = await updateClipboard(usageKey);
      if (newData) {
        // Update the clipboard state if we have new data
        queryClient.setQueryData(CLIPBOARD_QUERY_KEY, newData);
      } else {
        // If we don't have new data, invalidate the query
        queryClient.invalidateQueries({ queryKey: CLIPBOARD_QUERY_KEY });
      }
    } catch (error) {
      showToast(intl.formatMessage(messages.error));
      return;
    }
    // Update the clipboard state across all other open browser tabs too:
    try {
      clipboardBroadcastChannel?.postMessage(newData);
    } catch (error) {
      // Log the error but no need to show it to the user.
      // istanbul ignore next
      // eslint-disable-next-line no-console
      console.error('Unable to sync clipboard state across other open tabs:', error);
    }
    showToast(intl.formatMessage(messages.done));
  }, [showToast, intl, queryClient]);

  const handleBroadcastMessage = useCallback((event: MessageEvent) => {
    // Note: if this useClipboard() hook is used many times on one page,
    // this will result in many separate calls to setQueryData() whenever
    // the clipboard contents change, but that is fine and shouldn't actually
    // cause any issues. If it did, we could refactor this into a
    // <ClipboardContextProvider> that manages a single clipboardBroadcastChannel
    // rather than having a separate channel per useClipboard hook.
    queryClient.setQueryData(['clipboard'], event.data);
  }, [queryClient]);

  useEffect(() => {
    // Handle messages from the broadcast channel
    clipboardBroadcastChannel?.addEventListener('message', handleBroadcastMessage);
    // Cleanup function for the BroadcastChannel when the hook is unmounted
    return () => {
      clipboardBroadcastChannel?.removeEventListener('message', handleBroadcastMessage);
    };
  }, []);

  const isPasteable = canEdit && clipboardData?.content?.status !== CLIPBOARD_STATUS.expired;
  const showPasteUnit = isPasteable && clipboardData?.content?.blockType === 'vertical';
  const showPasteSubsection = isPasteable && clipboardData?.content?.blockType === 'sequential';
  const showPasteSection = isPasteable && clipboardData?.content?.blockType === 'chapter';
  const showPasteXBlock = isPasteable
    && clipboardData?.content
    && !STRUCTURAL_XBLOCK_TYPES.includes(clipboardData.content?.blockType);

  return {
    showPasteUnit,
    showPasteSubsection,
    showPasteSection,
    showPasteXBlock,
    sharedClipboardData: clipboardData,
    isPasteable,
    copyToClipboard,
  };
};

export default useClipboard;
