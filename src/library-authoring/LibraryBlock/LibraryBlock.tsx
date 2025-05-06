import { useEffect } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { getConfig } from '@edx/frontend-platform';

import messages from './messages';
import { IFRAME_FEATURE_POLICY } from '../../constants';
import { useIframeBehavior } from '../../generic/hooks/useIframeBehavior';
import { useIframe } from '../../generic/hooks/context/hooks';
import { useIframeContent } from '../../generic/hooks/useIframeContent';

export type VersionSpec = 'published' | 'draft' | number;

interface LibraryBlockProps {
  onBlockNotification?: (event: { eventType: string; [key: string]: any }) => void;
  usageKey: string;
  version?: VersionSpec;
  view?: string;
  scrolling?: string;
  minHeight?: string;
  scrollIntoView?: boolean;
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
export const LibraryBlock = ({
  onBlockNotification,
  usageKey,
  version,
  view,
  minHeight,
  scrolling = 'no',
  scrollIntoView = false,
}: LibraryBlockProps) => {
  const { iframeRef, setIframeRef } = useIframe();
  const xblockView = view ?? 'student_view';

  const studioBaseUrl = getConfig().STUDIO_BASE_URL;

  const intl = useIntl();
  const queryStr = version ? `?version=${version}` : '';
  const iframeUrl = `${studioBaseUrl}/xblocks/v2/${usageKey}/embed/${xblockView}/${queryStr}`;
  const { iframeHeight } = useIframeBehavior({
    id: usageKey,
    iframeUrl,
    iframeRef,
    onBlockNotification,
  });

  useEffect(() => {
    /* istanbul ignore next */
    if (scrollIntoView) {
      iframeRef?.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [scrollIntoView]);

  useIframeContent(iframeRef, setIframeRef);

  return (
    <iframe
      ref={iframeRef}
      title={intl.formatMessage(messages.iframeTitle)}
      src={iframeUrl}
      data-testid="block-preview"
      name={`xblock-iframe-${usageKey}`}
      id={`xblock-iframe-${usageKey}`}
      frameBorder="0"
      loading="lazy"
      referrerPolicy="origin"
      style={{
        width: '100%', height: iframeHeight, pointerEvents: 'auto', minHeight,
      }}
      allow={IFRAME_FEATURE_POLICY}
      allowFullScreen
      scrolling={scrolling}
    />
  );
};
