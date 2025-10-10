import { useEffect } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { getConfig } from '@edx/frontend-platform';

import { IFRAME_FEATURE_POLICY } from '@src/constants';
import { useIframeBehavior } from '@src/generic/hooks/useIframeBehavior';
import { useIframe } from '@src/generic/hooks/context/hooks';
import { useIframeContent } from '@src/generic/hooks/useIframeContent';
import { isBlockV1Key } from '@src/generic/key-utils';

import messages from './messages';

export type VersionSpec = 'published' | 'draft' | number;

interface LibraryBlockProps {
  onBlockNotification?: (event: { eventType: string; [key: string]: any }) => void;
  usageKey: string;
  version?: VersionSpec;
  view?: string;
  scrolling?: string;
  minHeight?: string;
  scrollIntoView?: boolean;
  showTitle?: boolean,
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
  showTitle = false,
}: LibraryBlockProps) => {
  const { iframeRef, setIframeRef } = useIframe();
  const xblockView = view ?? 'student_view';

  const studioBaseUrl = getConfig().STUDIO_BASE_URL;
  const lmsBaseUrl = getConfig().LMS_BASE_URL;
  const isBlockV1 = isBlockV1Key(usageKey);

  const intl = useIntl();
  const params = new URLSearchParams();
  if (version) {
    params.set('version', version.toString());
  }
  if (showTitle) {
    params.set('show_title', 'true');
  }

  // For now, always show the draft version of the Xblock v1
  // It would be better to use a Studio URL for this, but there is no embeddable URL
  // to render a single component in the Studio API as far as we can tell.
  const iframeUrl = isBlockV1
    ? `${lmsBaseUrl}/xblock/${usageKey.replace('+type@', '+branch@draft-branch+type@')}?disable_staff_debug_info=True`
    : `${studioBaseUrl}/xblocks/v2/${usageKey}/embed/${xblockView}/${params.toString() ? `?${params.toString()}` : ''}`;
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
