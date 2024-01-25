import { useDispatch, useSelector } from 'react-redux';

import updateClipboardContent from './slice';

// On the course outline page, many different UI elements (for now, every unit
// on the page) need to know the status of the user's clipboard. This singleton
// manages the state of the user's clipboard and can emit events whenever the
// clipboard is changed, whether from another tab or some action the user took
// on this page.

const useClipboardManager = () => {
  // Refresh the status when something is copied on another tab:
  const dispatch = useDispatch();
  const clipboardBroadcastChannel = new BroadcastChannel("studio_clipboard_channel");
  clipboardBroadcastChannel.onmessage = (event) => {
    dispatch(updateUserClipboard(event.data, false));
  };

  const updateUserClipboard = (newUserClipboard, broadcast = true) => {
    dispatch(updateClipboardContent(newUserClipboard));
    if (broadcast) {
      // notify any other open tabs
      this.clipboardBroadcastChannel.postMessage(newUserClipboard);
    }
  }
};
