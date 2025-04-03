import React, {
  createContext, MutableRefObject, useRef, useCallback, useMemo, ReactNode,
} from 'react';
import { logError } from '@edx/frontend-platform/logging';

export interface IframeContextType {
  iframeRef: MutableRefObject<HTMLIFrameElement | null>;
  setIframeRef: (ref: MutableRefObject<HTMLIFrameElement | null>) => void;
  sendMessageToIframe: (messageType: string, payload: unknown, consumerWindow?: Window | null) => void;
}

export const IframeContext = createContext<IframeContextType | undefined>(undefined);

export const IframeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const setIframeRef = useCallback((ref: MutableRefObject<HTMLIFrameElement | null>) => {
    iframeRef.current = ref.current;
  }, []);

  const sendMessageToIframe = useCallback((messageType: string, payload: any, consumerWindow?: Window | null) => {
    const iframeWindow = iframeRef?.current?.contentWindow;
    const targetWindow = consumerWindow || iframeWindow;
    if (targetWindow) {
      try {
        targetWindow.postMessage({ type: messageType, payload }, '*');
      } catch (error) {
        logError('Failed to send message to iframe:', error);
      }
    } else {
      logError('Iframe is not accessible or loaded yet.');
    }
  }, [iframeRef]);

  const value = useMemo(() => ({
    iframeRef,
    setIframeRef,
    sendMessageToIframe,
  }), [setIframeRef, sendMessageToIframe]);

  return (
    <IframeContext.Provider value={value}>
      {children}
    </IframeContext.Provider>
  );
};
