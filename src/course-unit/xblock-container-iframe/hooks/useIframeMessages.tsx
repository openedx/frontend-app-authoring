import { useEffect } from 'react';

/**
 * Hook for managing and handling messages received by the iframe.
 *
 * @param {Record<string, (payload: any) => void>} messageHandlers -
 * A mapping of message types to their corresponding handler functions.
 */
export const useIframeMessages = (messageHandlers: Record<string, (payload: any) => void>) => {
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const { type, payload } = event.data || {};
      if (type in messageHandlers) {
        messageHandlers[type](payload);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [messageHandlers]);
};
