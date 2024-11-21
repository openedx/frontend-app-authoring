import { ReactNode } from 'react';
import { renderHook } from '@testing-library/react-hooks';

import { useIframe } from './hooks';
import { IframeProvider } from './iFrameContext';

describe('useIframe hook', () => {
  it('throws an error when used outside of IframeProvider', () => {
    const { result } = renderHook(() => useIframe());
    expect(result.error).toEqual(new Error('useIframe must be used within an IframeProvider'));
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
