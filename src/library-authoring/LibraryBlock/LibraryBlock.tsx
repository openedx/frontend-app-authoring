import { useEffect, useRef, useState } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { getConfig } from '@edx/frontend-platform';

import messages from './messages';

export type VersionSpec = 'published' | 'draft' | number;

interface LibraryBlockProps {
  onBlockNotification?: (event: { eventType: string; [key: string]: any }) => void;
  usageKey: string;
  version?: VersionSpec;
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
export const LibraryBlock = ({ onBlockNotification, usageKey, version }: LibraryBlockProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iFrameHeight, setIFrameHeight] = useState(50);
  const studioBaseUrl = getConfig().STUDIO_BASE_URL;

  const intl = useIntl();

  /**
   * Handle any messages we receive from the XBlock Runtime code in the IFrame.
   * See wrap.ts to see the code that sends these messages.
   */
  /* istanbul ignore next */
  const receivedWindowMessage = async (event) => {
    if (!iframeRef.current || event.source !== iframeRef.current.contentWindow) {
      return; // This is some other random message.
    }

    const { method, replyKey, ...args } = event.data;

    if (method === 'update_frame_height') {
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
   * Prepare to receive messages from the IFrame.
   */
  useEffect(() => {
    // Messages are the only way that the code in the IFrame can communicate
    // with the surrounding UI.
    window.addEventListener('message', receivedWindowMessage);
    if (window.self !== window.top) {
      // This component is loaded inside an iframe.
      setIFrameHeight(86);
    }

    return () => {
      window.removeEventListener('message', receivedWindowMessage);
    };
  }, []);

  const queryStr = version ? `?version=${version}` : '';

  return (
    <div style={{
      height: `${iFrameHeight}vh`,
      boxSizing: 'content-box',
      position: 'relative',
      overflow: 'hidden',
      minHeight: '200px',
    }}
    >
      <iframe
        ref={iframeRef}
        title={intl.formatMessage(messages.iframeTitle)}
        src={`${studioBaseUrl}/xblocks/v2/${usageKey}/embed/student_view/${queryStr}`}
        data-testid="block-preview"
        style={{
          width: '100%',
          height: '100%',
          minHeight: '200px',
          border: '0 none',
        }}
        // allowing 'autoplay' is required to allow the video XBlock to control the YouTube iframe it has.
        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"

      />
    </div>
  );
};
