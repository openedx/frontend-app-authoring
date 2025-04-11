import { ReactNode } from 'react';
import { renderHook } from '@testing-library/react';

import { useIframe } from './hooks';
import { IframeProvider } from './iFrameContext';

describe('useIframe hook', () => {
  it('throws an error when used outside of IframeProvider', () => {
    expect(() => { renderHook(() => useIframe()); }).toThrow('useIframe must be used within an IframeProvider');
  });

  it('returns context value when used inside IframeProvider', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <IframeProvider>
        {children}
      </IframeProvider>
    );

    const { result } = renderHook(() => useIframe(), { wrapper });
    expect(result.current).toHaveProperty('setIframeRef');
    expect(result.current).toHaveProperty('sendMessageToIframe');
  });
});
