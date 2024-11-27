import { useCallback, useEffect } from 'react';
import { logError } from '@edx/frontend-platform/logging';
// eslint-disable-next-line import/no-extraneous-dependencies
import { useKeyedState } from '@edx/react-unit-test-utils';

import { useEventListener } from '../../../generic/hooks';
import { stateKeys, messageTypes } from '../../constants';
import { useLoadBearingHook } from './useLoadBearingHook';
import { UseIFrameBehaviorTypes, UseIFrameBehaviorReturnTypes } from './types';

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
export const useIFrameBehavior = ({
  id,
  iframeUrl,
  onLoaded = true,
}: UseIFrameBehaviorTypes): UseIFrameBehaviorReturnTypes => {
  // Do not remove this hook.  See function description.
  useLoadBearingHook(id);

  const [iframeHeight, setIframeHeight] = useKeyedState<number>(stateKeys.iframeHeight, 0);
  const [hasLoaded, setHasLoaded] = useKeyedState<boolean>(stateKeys.hasLoaded, false);
  const [showError, setShowError] = useKeyedState<boolean>(stateKeys.showError, false);
  const [windowTopOffset, setWindowTopOffset] = useKeyedState<number | null>(stateKeys.windowTopOffset, null);

  const receiveMessage = useCallback(({ data }: MessageEvent) => {
    const { payload, type } = data;

    if (type === messageTypes.resize) {
      setIframeHeight(payload.height);

      if (!hasLoaded && iframeHeight === 0 && payload.height > 0) {
        setHasLoaded(true);
      }
    } else if (type === messageTypes.videoFullScreen) {
      // We observe exit from the video xblock fullscreen mode
      // and scroll to the previously saved scroll position
      if (!payload.open && windowTopOffset !== null) {
        window.scrollTo(0, Number(windowTopOffset));
      }

      // We listen for this message from LMS to know when we need to
      // save or reset scroll position on toggle video xblock fullscreen mode
      setWindowTopOffset(payload.open ? window.scrollY : null);
    } else if (data.offset) {
      // We listen for this message from LMS to know when the page needs to
      // be scrolled to another location on the page.
      window.scrollTo(0, data.offset + document.getElementById('unit-iframe')!.offsetTop);
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
