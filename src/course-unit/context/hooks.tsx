import { useContext } from 'react';

import { IframeContext, IframeContextType } from './iFrameContext';

export const useIframe = (): IframeContextType => {
  const context = useContext(IframeContext);
  if (!context) {
    // eslint-disable-next-line no-console
    console.error('useIframe must be used within an IframeProvider');
  }
  return context as IframeContextType;
};
