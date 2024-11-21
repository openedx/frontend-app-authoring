import {
  createContext, MutableRefObject, useRef, useCallback, useMemo, ReactNode,
} from 'react';
import { logError } from '@edx/frontend-platform/logging';

export interface IframeContextType {
  setIframeRef: (ref: MutableRefObject<HTMLIFrameElement | null>) => void;
  sendMessageToIframe: (messageType: string, payload: unknown) => void;
}

export const IframeContext = createContext<IframeContextType | undefined>(undefined);

export const IframeProvider: React.FC = ({ children }: { children: ReactNode }) => {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const setIframeRef = useCallback((ref: MutableRefObject<HTMLIFrameElement | null>) => {
    iframeRef.current = ref.current;
  }, []);

  const sendMessageToIframe = useCallback((messageType: string, payload: any) => {
    const iframeWindow = iframeRef?.current?.contentWindow;
    if (iframeWindow) {
      try {
        iframeWindow.postMessage({ type: messageType, payload }, '*');
      } catch (error) {
        logError('Failed to send message to iframe:', error);
      }
    } else {
      logError('Iframe is not accessible or loaded yet.');
    }
  }, [iframeRef]);

  const value = useMemo(() => ({
    setIframeRef,
    sendMessageToIframe,
  }), [setIframeRef, sendMessageToIframe]);

  return (
    <IframeContext.Provider value={value}>
      {children}
    </IframeContext.Provider>
  );
};
