import { useQuery, useQueryClient } from '@tanstack/react-query';
import { logError } from '@edx/frontend-platform/logging';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

import {
  hideProcessingNotification,
  showProcessingNotification,
} from '../../processing-notification/data/slice';
import { updateSavingStatus } from '../../data/slice';
import { getClipboard, updateClipboard } from '../../data/api';
import {
  CLIPBOARD_STATUS,
  NOTIFICATION_MESSAGES,
  STRUCTURAL_XBLOCK_TYPES,
  STUDIO_CLIPBOARD_CHANNEL,
} from '../../../constants';
import { RequestStatus } from '../../../data/constants';

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
  const [clipboardBroadcastChannel] = useState(() => new BroadcastChannel(STUDIO_CLIPBOARD_CHANNEL));
  const { data: clipboardData } = useQuery({
    queryKey: ['clipboard'],
    queryFn: getClipboard,
    refetchInterval: (data) => (data?.content?.status === CLIPBOARD_STATUS.loading ? 1000 : false),
  });

  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  const copyToClipboard = async (usageKey) => {
    // TODO: Remove pooling??
    const POLL_INTERVAL_MS = 1000; // Timeout duration for polling in milliseconds

    dispatch(showProcessingNotification(NOTIFICATION_MESSAGES.copying));
    dispatch(updateSavingStatus({ status: RequestStatus.PENDING }));

    try {
      let newData = await updateClipboard(usageKey);

      while (newData.content?.status === CLIPBOARD_STATUS.loading) {
        // eslint-disable-next-line no-await-in-loop,no-promise-executor-return
        await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
        newData = await getClipboard(); // eslint-disable-line no-await-in-loop
      }

      if (newData.content?.status === CLIPBOARD_STATUS.ready) {
        dispatch(updateSavingStatus({ status: RequestStatus.SUCCESSFUL }));
        queryClient.setQueryData(['clipboard'], newData);
      // istabul ignore next: the else block should never be reached
      } else {
        throw new Error(`Unexpected clipboard status "${newData.content?.status}" in successful API response.`);
      }
    } catch (error) {
      logError('Error copying to clipboard:', error);
    } finally {
      dispatch(hideProcessingNotification());
    }
  };

  useEffect(() => {
    // Handle updates to clipboard data
    if (canEdit && clipboardData) {
      clipboardBroadcastChannel.postMessage(clipboardData);
    }
  }, [clipboardData, canEdit, clipboardBroadcastChannel]);

  useEffect(() => {
    // Handle messages from the broadcast channel
    clipboardBroadcastChannel.onmessage = (event) => {
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
