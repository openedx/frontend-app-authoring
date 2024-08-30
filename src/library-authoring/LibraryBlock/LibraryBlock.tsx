import React, {
  useEffect, useMemo, useRef, useState,
} from 'react';
import { ensureConfig, getConfig } from '@edx/frontend-platform';

import type { XBlockRenderResponse } from '../data/api';
import wrapBlockHtmlForIFrame from './wrap';

// FixMe: We need this?
ensureConfig(['LMS_BASE_URL', 'SECURE_ORIGIN_XBLOCK_BOOTSTRAP_HTML_URL'], 'library block component');

interface LibraryBlockProps {
  getHandlerUrl: (usageId: string) => Promise<string>;
  onBlockNotification?: (event: { eventType: string; [key: string]: any }) => void;
  view: XBlockRenderResponse
}
/**
 * React component that displays an XBlock in a sandboxed IFrame.
 *
 * The IFrame is resized responsively so that it fits the content height.
 *
 * We use an IFrame so that the XBlock code, including user-authored HTML,
 * cannot access things like the user's cookies, nor can it make GET/POST
 * requests as the user. However, it is allowed to call any XBlock handlers.
 */
const LibraryBlock = ({ getHandlerUrl, onBlockNotification, view }: LibraryBlockProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iFrameHeight, setIFrameHeight] = useState(400);

  const html = useMemo(() => {
    if (!view) {
      return null;
    }

    return wrapBlockHtmlForIFrame(
      view.content,
      view.resources,
      getConfig().LMS_BASE_URL,
    );
  }, [view]);

  /**
   * Handle any messages we receive from the XBlock Runtime code in the IFrame.
   * See wrap.ts to see the code that sends these messages.
   */
  const receivedWindowMessage = async (event) => {
    if (!iframeRef.current || event.source !== iframeRef.current.contentWindow) {
      return; // This is some other random message.
    }

    const { method, replyKey, ...args } = event.data;
    const frame = iframeRef.current.contentWindow;
    const sendReply = async (data) => {
      frame?.postMessage({ ...data, replyKey }, '*');
    };

    if (method === 'bootstrap') {
      sendReply({ initialHtml: html });
    } else if (method === 'get_handler_url') {
      const handlerUrl = await getHandlerUrl(args.usageId);
      sendReply({ handlerUrl });
    } else if (method === 'update_frame_height') {
      setIFrameHeight(args.height);
    } else if (method?.indexOf('xblock:') === 0) {
      // This is a notification from the XBlock's frontend via 'runtime.notify(event, args)'
      if (onBlockNotification) {
        onBlockNotification({
          eventType: method.substr(7), // Remove the 'xblock:' prefix that we added in wrap.ts
          ...args,
        });
      }
    }
  };

  /**
   * Load the XBlock data from the LMS and then inject it into our IFrame.
   */
  useEffect(() => {
    // Prepare to receive messages from the IFrame.
    // Messages are the only way that the code in the IFrame can communicate
    // with the surrounding UI.
    window.addEventListener('message', receivedWindowMessage);

    return () => {
      window.removeEventListener('message', receivedWindowMessage);
    };
  }, [view]);

  /* Only draw the iframe if the HTML has already been set.  This is because xblock-bootstrap.html will only request
   * HTML once, upon being rendered. */
  if (!html) {
    return null;
  }

  return (
    <div style={{
      height: `${iFrameHeight}px`,
      boxSizing: 'content-box',
      position: 'relative',
      overflow: 'hidden',
      minHeight: '200px',
      margin: '12px',
      border: '1px solid #ccc',
    }}
    >
      <iframe
        key={view.content}
        ref={iframeRef}
        title="block"
        src={getConfig().SECURE_ORIGIN_XBLOCK_BOOTSTRAP_HTML_URL || 'https://metadata-test233.s3.amazonaws.com/xblock-bootstrap.html'}
        data-testid="block-preview"
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: '100%',
          height: '100%',
          minHeight: '200px',
          border: '0 none',
          backgroundColor: 'white',
        }}
        // allowing 'autoplay' is required to allow the video XBlock to control the YouTube iframe it has.
        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
        sandbox={[
          'allow-forms',
          'allow-modals',
          'allow-popups',
          'allow-popups-to-escape-sandbox',
          'allow-presentation',
          'allow-same-origin', // This is only secure IF the IFrame source
          // is served from a completely different domain name
          // e.g. labxchange-xblocks.net vs www.labxchange.org
          'allow-scripts',
          'allow-top-navigation-by-user-activation',
        ].join(' ')}
      />
    </div>
  );
};

export default LibraryBlock;
