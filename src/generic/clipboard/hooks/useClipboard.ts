import { useIntl } from '@edx/frontend-platform/i18n';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useContext, useEffect, useState } from 'react';

import { getClipboard, updateClipboard } from '../../data/api';
import {
  CLIPBOARD_STATUS,
  STRUCTURAL_XBLOCK_TYPES,
  STUDIO_CLIPBOARD_CHANNEL,
} from '../../../constants';
import { ToastContext } from '../../toast-context';
import messages from './messages';

/**
 * Custom React hook for managing clipboard functionality.
 *
 * @param canEdit - Flag indicating whether the clipboard is editable.
 * @returns - An object containing state variables and functions related to clipboard functionality.
 * @property showPasteUnit - Flag indicating whether the "Paste Unit" button should be visible.
 * @property showPasteXBlock - Flag indicating whether the "Paste XBlock" button should be visible.
 * @property sharedClipboardData - The shared clipboard data object.
 * @property copyToClipboard - Function to copy the current selection to the clipboard.
 */
const useClipboard = (canEdit: boolean = true) => {
  const intl = useIntl();
  const [clipboardBroadcastChannel] = useState(() => new BroadcastChannel(STUDIO_CLIPBOARD_CHANNEL));
  const { data: clipboardData } = useQuery({
    queryKey: ['clipboard'],
    queryFn: getClipboard,
    refetchInterval: (data) => (data?.content?.status === CLIPBOARD_STATUS.loading ? 1000 : false),
  });
  const { showToast } = useContext(ToastContext);

  const queryClient = useQueryClient();

  const copyToClipboard = async (usageKey: string) => {
    // This code is synchronous for now, but it could be made asynchronous in the future.
    // In that case, the `done` message should be shown after the asynchronous operation completes.
    showToast(intl.formatMessage(messages.copying));
    try {
      const newData = await updateClipboard(usageKey);
      clipboardBroadcastChannel.postMessage(newData);
      queryClient.setQueryData(['clipboard'], newData);
      showToast(intl.formatMessage(messages.done));
    } catch (error) {
      showToast(intl.formatMessage(messages.error));
    }
  };

  useEffect(() => {
    // Handle messages from the broadcast channel
    clipboardBroadcastChannel.onmessage = (event) => {
      // Note: if this useClipboard() hook is used many times on one page,
      // this will result in many separate calls to setQueryData() whenever
      // the clipboard contents change, but that is fine and shouldn't actually
      // cause any issues. If it did, we could refactor this into a
      // <ClipboardContextProvider> that manages a single clipboardBroadcastChannel
      // rather than having a separate channel per useClipboard hook.
      queryClient.setQueryData(['clipboard'], event.data);
    };

    // Cleanup function for the BroadcastChannel when the hook is unmounted
    return () => {
      clipboardBroadcastChannel.close();
    };
  }, [clipboardBroadcastChannel]);

  const isPasteable = canEdit && clipboardData?.content?.status !== CLIPBOARD_STATUS.expired;
  const showPasteUnit = isPasteable && clipboardData?.content?.blockType === 'vertical';
  const showPasteXBlock = isPasteable
    && clipboardData?.content
    && !STRUCTURAL_XBLOCK_TYPES.includes(clipboardData.content?.blockType);

  return {
    showPasteUnit,
    showPasteXBlock,
    sharedClipboardData: clipboardData,
    copyToClipboard,
  };
};

export default useClipboard;
