import {
  memo, useRef, useState, useEffect,
} from 'react';
import PropTypes from 'prop-types';
import { ensureConfig, getConfig } from '@edx/frontend-platform';
import { useSelector } from 'react-redux';

import { LoadingSpinner } from '../../../generic/Loading';
import { COMPONENT_TYPES } from '../../constants';
import { blockViewShape, fetchable, IFRAME_FEATURE_POLICY } from '../constants';
import { wrapBlockHtmlForIFrame } from './iframe-wrapper';
import { getCsrfTokenData } from '../../data/selectors';

ensureConfig(['STUDIO_BASE_URL', 'SECURE_ORIGIN_XBLOCK_BOOTSTRAP_HTML_URL'], 'studio xblock component');

const XBlockContent = memo(({
  view, type, getHandlerUrl, onBlockNotification, stylesWithContent,
}) => {
  const csrfTokenData = useSelector(getCsrfTokenData);
  const iframeRef = useRef(null);
  const [html, setHtml] = useState(null);
  const [iframeHeight, setIFrameHeight] = useState(0);
  const [iframeKey, setIFrameKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const processView = () => {
      if (view.html) {
        const newHtml = wrapBlockHtmlForIFrame(
          view.html,
          view.resources,
          getConfig().STUDIO_BASE_URL,
          type,
          stylesWithContent,
          csrfTokenData,
        );

        // Load the XBlock HTML into the IFrame:
        // iframe will only re-render in React when its property changes (key here)
        setHtml(newHtml);
        setIFrameKey(prevKey => prevKey + 1);
      }
    };

    // Process the XBlock view:
    processView();
  }, [view, type, stylesWithContent, csrfTokenData]);

  useEffect(() => {
    // Handle any messages we receive from the XBlock Runtime code in the IFrame.
    // See iframe-wrapper.js to see the code that sends these messages.
    const receivedWindowMessage = async (event) => {
      if (iframeRef.current === null || event.source !== iframeRef.current.contentWindow) {
        return;
      } // This is some other random message.

      const { method, replyKey, ...args } = event.data;

      const frame = iframeRef.current.contentWindow;

      const sendReply = async (data) => {
        frame.postMessage({ ...data, replyKey }, '*');
      };

      if (method === 'bootstrap') {
        await sendReply({ initialHtml: html });
      } else if (method === 'get_handler_url') {
        const handlerUrl = await getHandlerUrl(args.usageId);
        await sendReply({ handlerUrl });
      } else if (method === 'update_frame_height') {
        setIFrameHeight(args.height);
      } else if (method?.indexOf('xblock:') === 0) {
        if (onBlockNotification) {
          // This is a notification from the XBlock's frontend via 'runtime.notify(event, args)'
          onBlockNotification({
            eventType: method.substr('xblock'.length), // Remove the 'xblock:' prefix that we added in iframe-wrapper.ts
            ...args,
          });
        }
      }
    };

    // Prepare to receive messages from the IFrame.
    // Messages are the only way that the code in the IFrame can communicate
    // with the surrounding UI.
    window.addEventListener('message', receivedWindowMessage);

    return () => {
      window.removeEventListener('message', receivedWindowMessage);
    };
  }, [html, getHandlerUrl, onBlockNotification]);

  /* Only draw the iframe if the HTML has already been set. This is because xblock-bootstrap.html will only request
   * HTML once, upon being rendered. */
  if (html === null) {
    return null;
  }

  return (
    <div>
      {isLoading && (
        <div className="d-flex justify-content-center align-items-center flex-column">
          <LoadingSpinner />
        </div>
      )}
      <div
        style={{ height: `${iframeHeight}px` }}
        className="xblock-content"
      >
        <iframe
          key={iframeKey}
          ref={iframeRef}
          title="block"
          src={`${getConfig().BASE_URL}${getConfig().SECURE_ORIGIN_XBLOCK_BOOTSTRAP_HTML_URL}`}
          className="xblock-content-iframe"
          // allowing 'autoplay' is required to allow the video XBlock to control the YouTube iframe it has.
          allow={IFRAME_FEATURE_POLICY}
          referrerPolicy="origin"
          frameBorder={0}
          scrolling="no"
          onLoad={() => setIsLoading(false)}
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
    </div>
  );
});

XBlockContent.propTypes = {
  getHandlerUrl: PropTypes.func.isRequired,
  onBlockNotification: PropTypes.func,
  view: fetchable(blockViewShape).isRequired,
  type: PropTypes.oneOfType(Object.values(COMPONENT_TYPES)).isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  stylesWithContent: PropTypes.array,
};

XBlockContent.defaultProps = {
  onBlockNotification: null,
  stylesWithContent: null,
};

export default XBlockContent;
