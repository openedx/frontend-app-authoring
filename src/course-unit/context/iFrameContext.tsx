import React, { createContext, MutableRefObject, useState } from 'react';

export interface IframeContextType {
  setIframeRef: (ref: MutableRefObject<HTMLIFrameElement | null>) => void;
  sendMessageToIframe: (messageType: string, payload: any) => void;
}

export const IframeContext = createContext<IframeContextType | undefined>(undefined);

export const IframeProvider: React.FC = ({ children }) => {
  const [iframeRef, setIframeRef] = useState<MutableRefObject<HTMLIFrameElement | null> | null>(null);

  const sendMessageToIframe = (messageType: string, payload: any) => {
    const iframeWindow = iframeRef?.current?.contentWindow;
    if (iframeWindow) {
      try {
        iframeWindow.postMessage({ type: messageType, payload }, '*');
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to send message to iframe:', error);
      }
    } else {
      // eslint-disable-next-line no-console
      console.warn('Iframe is not accessible or loaded yet.');
    }
  };

  return (
    // eslint-disable-next-line react/jsx-no-constructed-context-values
    <IframeContext.Provider value={{ setIframeRef, sendMessageToIframe }}>
      {children}
    </IframeContext.Provider>
  );
};
