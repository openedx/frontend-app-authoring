import { useEffect, RefObject } from 'react';

/**
 * Hook for managing iframe content and providing utilities to interact with the iframe.
 *
 * @param {React.RefObject<HTMLIFrameElement>} iframeRef - A React ref for the iframe element.
 * @param {(ref: React.RefObject<HTMLIFrameElement>) => void} setIframeRef -
 * A function to associate the iframeRef with the parent context.
 *
 * @returns {Object} - An object containing utility functions.
 * @returns {() => void}
 */
export const useIframeContent = (
  iframeRef: RefObject<HTMLIFrameElement>,
  setIframeRef: (ref: RefObject<HTMLIFrameElement>) => void,
): void => {
  useEffect(() => {
    setIframeRef(iframeRef);
  }, [setIframeRef, iframeRef]);
};
