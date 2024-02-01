import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import { CLIPBOARD_STATUS, STRUCTURAL_XBLOCK_TYPES, STUDIO_CLIPBOARD_CHANNEL } from '../../../constants';
import { getClipboardData } from '../../data/selectors';

/**
 * Custom React hook for managing clipboard functionality.
 *
 * @returns {Object} - An object containing state variables and functions related to clipboard functionality.
 * @property {boolean} showPasteUnit - Flag indicating whether the "Paste Unit" button should be visible.
 * @property {boolean} showPasteXBlock - Flag indicating whether the "Paste XBlock" button should be visible.
 * @property {Object} sharedClipboardData - The shared clipboard data object.
 */
const useCopyToClipboard = () => {
  const [clipboardBroadcastChannel] = useState(() => new BroadcastChannel(STUDIO_CLIPBOARD_CHANNEL));
  const [showPasteUnit, setShowPasteUnit] = useState(false);
  const [showPasteXBlock, setShowPasteXBlock] = useState(false);
  const [sharedClipboardData, setSharedClipboardData] = useState({});
  const clipboardData = useSelector(getClipboardData);

  // Function to refresh the paste button's visibility
  const refreshPasteButton = (data) => {
    const isPasteable = data?.content && data.content.status !== CLIPBOARD_STATUS.expired;
    const isPasteableXBlock = isPasteable && !STRUCTURAL_XBLOCK_TYPES.includes(data.content.blockType);
    const isPasteableUnit = isPasteable && data.content.blockType === 'vertical';

    setShowPasteXBlock(!!isPasteableXBlock);
    setShowPasteUnit(!!isPasteableUnit);
  };

  useEffect(() => {
    // Handle updates to clipboard data
    refreshPasteButton(clipboardData);
    setSharedClipboardData(clipboardData);
    clipboardBroadcastChannel.postMessage(clipboardData);
  }, [clipboardData, clipboardBroadcastChannel]);

  useEffect(() => {
    // Handle messages from the broadcast channel
    clipboardBroadcastChannel.onmessage = (event) => {
      setSharedClipboardData(event.data);
      refreshPasteButton(event.data);
    };

    // Cleanup function for the BroadcastChannel when the hook is unmounted
    return () => {
      clipboardBroadcastChannel.close();
    };
  }, [clipboardBroadcastChannel]);

  return { showPasteUnit, showPasteXBlock, sharedClipboardData };
};

export default useCopyToClipboard;
