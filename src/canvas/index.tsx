import React, { useCallback, useEffect, useState } from 'react';
import { ModalDialog } from '@openedx/paragon';

import { IframeProvider } from 'generic/hooks/context/iFrameContext';
import { useIframe } from 'generic/hooks/context/hooks';
import { useEventListener } from 'generic/hooks/useEventListener';
import { useCanvasContext } from 'context/Canvas';

import { getJwtToken } from 'utils/auth';
import ZTOCenterLoading from 'shared/Components/Common/ZTOCenterLoading';
import { cn } from 'shared/lib/utils';

interface CanvasProps {
  isOpen: boolean;
  onClose: () => void;
}

// TODO: Get from env variable
const CANVAS_URL = 'http://localhost:3000/canvas';

const Canvas: React.FC<CanvasProps> = ({ isOpen, onClose }) => {
  const { iframeRef, setIframeRef, sendMessageToIframe } = useIframe();
  const [isIframeLoaded, setIsIframeLoaded] = useState(false);
  const { content } = useCanvasContext();

  useEffect(() => {
    setIframeRef(iframeRef);
  }, [setIframeRef]);

  useEffect(() => {
    const initializeIframe = async () => {
      const accessToken = await getJwtToken();
      if (!accessToken) {
        return;
      }

      // Send auth tokens once iframe is loaded
      // Wait for 1 second to ensure the iframe is loaded
      setTimeout(() => {
        sendMessageToIframe('AUTH_TOKENS', { accessToken, refreshToken: accessToken });
        sendMessageToIframe('CANVAS_CONTENT', { content });
      }, 500);
    };

    if (isIframeLoaded) {
      initializeIframe();
    }
  }, [sendMessageToIframe, isIframeLoaded]);

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

  const handleIframeLoad = useCallback(() => {
    setIsIframeLoaded(true);
  }, []);

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
      className="tw-relative"
    >
      <iframe
        ref={iframeRef}
        title="canvas-iframe"
        id="canvas-iframe"
        src={CANVAS_URL}
        allowFullScreen
        loading="lazy"
        referrerPolicy="origin"
        className={cn('tw-h-full tw-w-full tw-overflow-hidden')}
        onLoad={handleIframeLoad}
      />
      {/* Loading indicator */}
      {!isIframeLoaded && (
        <div className="tw-p-3 tw-h-full tw-w-full tw-bg-white tw-absolute tw-inset-0">
          <div className="tw-rounded-[20px] tw-border tw-border-gray-200 tw-shadow-lg tw-h-full tw-w-full">
            <ZTOCenterLoading
              description="Đang chờ xác thực từ ứng dụng chính..." // TODO: Translate
              className="tw-flex-col"
            />
          </div>
        </div>
      )}
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
