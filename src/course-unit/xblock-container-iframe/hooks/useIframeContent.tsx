import { useEffect, useCallback, RefObject } from 'react';

import { messageTypes } from '../../constants';

/**
 * Hook for managing iframe content and providing utilities to interact with the iframe.
 *
 * @param {React.RefObject<HTMLIFrameElement>} iframeRef - A React ref for the iframe element.
 * @param {(ref: React.RefObject<HTMLIFrameElement>) => void} setIframeRef -
 * A function to associate the iframeRef with the parent context.
 * @param {(type: string, payload: any) => void} sendMessageToIframe - A function to send messages to the iframe.
 *
 * @returns {Object} - An object containing utility functions.
 * @returns {() => void} return.refreshIframeContent -
 * A function to refresh the iframe content by sending a specific message.
 */
export const useIframeContent = (
  iframeRef: RefObject<HTMLIFrameElement>,
  setIframeRef: (ref: RefObject<HTMLIFrameElement>) => void,
  sendMessageToIframe: (type: string, payload: any) => void,
): { refreshIframeContent: () => void } => {
  useEffect(() => {
    setIframeRef(iframeRef);
  }, [setIframeRef, iframeRef]);

  // TODO: this artificial delay is a temporary solution
  // to ensure the iframe content is properly refreshed.
  const refreshIframeContent = useCallback(() => {
    setTimeout(() => sendMessageToIframe(messageTypes.refreshXBlock, null), 1000);
  }, [sendMessageToIframe]);

  return { refreshIframeContent };
};
