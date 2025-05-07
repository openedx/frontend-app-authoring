import { useCallback, useEffect } from 'react';
import { logError } from '@edx/frontend-platform/logging';
// eslint-disable-next-line import/no-extraneous-dependencies
import { useKeyedState } from '@edx/react-unit-test-utils';

import { useLoadBearingHook } from './useLoadBearingHook';
import { iframeStateKeys, iframeMessageTypes } from '../../constants';
import { UseIFrameBehaviorReturnTypes, UseIFrameBehaviorTypes } from '../types';
import { useEventListener } from './useEventListener';

/**
 * Custom hook to manage iframe behavior.
 *
 * @param {Object} params - The parameters for the hook.
 * @param {string} params.id - The unique identifier for the iframe.
 * @param {string} params.iframeUrl - The URL of the iframe.
 * @param {boolean} [params.onLoaded=true] - Flag to indicate if the iframe has loaded.
 * @returns {Object} The state and handlers for the iframe.
 * @returns {number} return.iframeHeight - The height of the iframe.
 * @returns {Function} return.handleIFrameLoad - The handler for iframe load event.
 * @returns {boolean} return.showError - Flag to indicate if there was an error loading the iframe.
 * @returns {boolean} return.hasLoaded - Flag to indicate if the iframe has loaded.
 */
export const useIframeBehavior = ({
  id,
  iframeUrl,
  onLoaded = true,
  iframeRef,
  onBlockNotification,
}: UseIFrameBehaviorTypes): UseIFrameBehaviorReturnTypes => {
  // Do not remove this hook.  See function description.
  useLoadBearingHook(id);

  const [iframeHeight, setIframeHeight] = useKeyedState<number>(iframeStateKeys.iframeHeight, 0);
  const [hasLoaded, setHasLoaded] = useKeyedState<boolean>(iframeStateKeys.hasLoaded, false);
  const [showError, setShowError] = useKeyedState<boolean>(iframeStateKeys.showError, false);
  const [windowTopOffset, setWindowTopOffset] = useKeyedState<number | null>(iframeStateKeys.windowTopOffset, null);

  const receiveMessage = useCallback((event: MessageEvent) => {
    if (!iframeRef.current || event.source !== iframeRef.current.contentWindow) {
      return; // This is some other random message.
    }
    const { data } = event;
    const { payload, type } = data;
    const { method, replyKey, ...args } = data;

    switch (type) {
      case iframeMessageTypes.resize:
        // Adding 10px as padding
        setIframeHeight(payload.height + 10);
        if (!hasLoaded && iframeHeight === 0 && payload.height > 0) {
          setHasLoaded(true);
        }
        break;
      case iframeMessageTypes.videoFullScreen:
        // We observe exit from the video xblock fullscreen mode
        // and scroll to the previously saved scroll position
        if (!payload.open && windowTopOffset !== null) {
          window.scrollTo(0, Number(windowTopOffset));
        }

        // We listen for this message from LMS to know when we need to
        // save or reset scroll position on toggle video xblock fullscreen mode
        setWindowTopOffset(payload.open ? window.scrollY : null);
        break;
      case iframeMessageTypes.xblockEvent:
        if (method?.indexOf('xblock:') === 0) {
          // This is a notification from the XBlock's frontend via 'runtime.notify(event, args)'
          onBlockNotification?.({
            eventType: method.substr(7), // Remove the 'xblock:' prefix that we added in wrap.ts
            ...args,
          });
        }
        break;
      default:
        if (data.offset) {
          // We listen for this message from LMS to know when the page needs to
          // be scrolled to another location on the page.
          window.scrollTo(0, data.offset + document.getElementById('unit-iframe')!.offsetTop);
        }
        break;
    }
  }, [
    id,
    onLoaded,
    hasLoaded,
    setHasLoaded,
    iframeHeight,
    setIframeHeight,
    windowTopOffset,
    setWindowTopOffset,
  ]);

  useEventListener('message', receiveMessage);

  const handleIFrameLoad = () => {
    if (!hasLoaded) {
      setShowError(true);
      logError('Unit iframe failed to load. Server possibly returned 4xx or 5xx response.', {
        iframeUrl,
      });
    }
  };

  useEffect(() => {
    setIframeHeight(0);
    setHasLoaded(false);
  }, [iframeUrl]);

  return {
    iframeHeight,
    handleIFrameLoad,
    showError,
    hasLoaded,
  };
};
