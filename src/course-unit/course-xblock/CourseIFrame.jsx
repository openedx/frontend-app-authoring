import { forwardRef } from 'react';
import PropTypes from 'prop-types';

import { IFRAME_FEATURE_POLICY } from './constants';

const CourseIFrame = forwardRef(({ title, ...props }, ref) => (
  <iframe
    title={title}
    // allowing 'autoplay' is required to allow the video XBlock to control the YouTube iframe it has.
    allow={IFRAME_FEATURE_POLICY}
    referrerPolicy="origin"
    frameBorder={0}
    scrolling="no"
    ref={ref}
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
    {...props}
  />
));

CourseIFrame.propTypes = {
  title: PropTypes.string.isRequired,
};

export default CourseIFrame;
