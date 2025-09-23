import React, { useCallback, useEffect } from 'react';
import { ModalDialog } from '@openedx/paragon';

import { IframeProvider } from 'generic/hooks/context/iFrameContext';
import { useIframe } from 'generic/hooks/context/hooks';
import { useEventListener } from 'generic/hooks/useEventListener';
import { useCanvasContext } from 'context/Canvas';

interface CanvasProps {
  isOpen: boolean;
  onClose: () => void;
}

// TODO: Get from env variable
const CANVAS_URL = 'http://localhost:3000';
export const IFRAME_FEATURE_POLICY = 'microphone *; camera *; midi *; geolocation *; encrypted-media *; clipboard-write *';

const Canvas: React.FC<CanvasProps> = ({ isOpen, onClose }) => {
  const { iframeRef, setIframeRef } = useIframe();

  useEffect(() => {
    setIframeRef(iframeRef);
  }, [setIframeRef]);

  const receiveMessage = useCallback(
    (event: MessageEvent) => {
      if (!iframeRef.current || event.source !== iframeRef.current.contentWindow) {
        return; // This is some other random message.
      }
      const { data } = event;
      const { type } = data;

      switch (type) {
        case 'close_canvas':
          onClose();
          break;
        default:
          break;
      }
    },
    [onClose],
  );

  useEventListener('message', receiveMessage);

  return (
    <ModalDialog
      title=""
      isOverflowVisible={false}
      size="fullscreen"
      isOpen={isOpen}
      hasCloseButton={false}
      variant="default"
      onClose={() => {}}
      isFullscreenOnMobile
    >
      <div className="tw-p-3 tw-w-full tw-h-full tw-bg-white">
        <iframe
          ref={iframeRef}
          title="canvas-iframe"
          id="canvas-iframe"
          src={CANVAS_URL}
          allow={IFRAME_FEATURE_POLICY}
          allowFullScreen
          loading="lazy"
          referrerPolicy="origin"
          className="tw-h-full tw-w-full tw-rounded-[20px] tw-overflow-hidden"
        />
      </div>
    </ModalDialog>
  );
};

const CanvasWithIframeProvider: React.FC<CanvasProps> = () => {
  const { isOpen, closeCanvas } = useCanvasContext();

  if (!isOpen) {
    return null;
  }

  return (
    <IframeProvider>
      <Canvas isOpen={isOpen} onClose={closeCanvas} />
    </IframeProvider>
  );
};

export default CanvasWithIframeProvider;
