import {
  useState, useLayoutEffect, useCallback, useEffect,
} from 'react';
import { logError } from '@edx/frontend-platform/logging';
// eslint-disable-next-line import/no-extraneous-dependencies
import { useKeyedState } from '@edx/react-unit-test-utils';

import { useEventListener } from '../../generic/hooks';
import { stateKeys, messageTypes } from '../constants';

interface UseIFrameBehaviorParams {
  id: string;
  iframeUrl: string;
  onLoaded?: boolean;
}

interface UseIFrameBehaviorReturn {
  iframeHeight: number;
  handleIFrameLoad: () => void;
  showError: boolean;
  hasLoaded: boolean;
}

/**
 * We discovered an error in Firefox where - upon iframe load - React would cease to call any
 * useEffect hooks until the user interacts with the page again.  This is particularly confusing
 * when navigating between sequences, as the UI partially updates leaving the user in a nebulous
 * state.
 *
 * We were able to solve this error by using a layout effect to update some component state, which
 * executes synchronously on render.  Somehow this forces React to continue it's lifecycle
 * immediately, rather than waiting for user interaction.  This layout effect could be anywhere in
 * the parent tree, as far as we can tell - we chose to add a conspicuously 'load bearing' (that's
 * a joke) one here so it wouldn't be accidentally removed elsewhere.
 *
 * If we remove this hook when one of these happens:
 * 1. React figures out that there's an issue here and fixes a bug.
 * 2. We cease to use an iframe for unit rendering.
 * 3. Firefox figures out that there's an issue in their iframe loading and fixes a bug.
 * 4. We stop supporting Firefox.
 * 5. An enterprising engineer decides to create a repo that reproduces the problem, submits it to
 *    Firefox/React for review, and they kindly help us figure out what in the world is happening
 *    so  we can fix it.
 *
 * This hook depends on the unit id just to make sure it re-evaluates whenever the ID changes.  If
 * we change whether or not the Unit component is re-mounted when the unit ID changes, this may
 * become important, as this hook will otherwise only evaluate the useLayoutEffect once.
 */
export const useLoadBearingHook = (id: string): void => {
  const setValue = useState(0)[1];
  useLayoutEffect(() => {
    setValue(currentValue => currentValue + 1);
  }, [id]);
};

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
}: UseIFrameBehaviorParams): UseIFrameBehaviorReturn => {
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
