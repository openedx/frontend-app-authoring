import { useRef } from 'react';
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import { getConfig } from '@edx/frontend-platform';

import { IFRAME_FEATURE_POLICY } from '../constants';
import { useIFrameBehavior } from './hooks';
import messages from './messages';

/**
 * This offset is necessary to fully display the dropdown actions of the XBlock
 * in case the XBlock does not have content inside.
 */
const IFRAME_BOTTOM_OFFSET = 160;

const XBlockContainerIframe = ({ blockId }) => {
  const intl = useIntl();
  const iframeRef = useRef(null);

  const iframeUrl = `${getConfig().STUDIO_BASE_URL}/container_embed/${blockId}`;

  const { iframeHeight } = useIFrameBehavior({
    blockId,
    iframeUrl,
  });

  return (
    <iframe
      ref={iframeRef}
      title={intl.formatMessage(messages.xblockIframeTitle)}
      src={iframeUrl}
      frameBorder="0"
      allow={IFRAME_FEATURE_POLICY}
      allowFullScreen
      loading="lazy"
      style={{ width: '100%', height: iframeHeight + IFRAME_BOTTOM_OFFSET }}
      scrolling="no"
      referrerPolicy="origin"
    />
  );
};

XBlockContainerIframe.propTypes = {
  blockId: PropTypes.string.isRequired,
};

export default XBlockContainerIframe;
