import { forwardRef, ForwardedRef, IframeHTMLAttributes } from 'react';
import classNames from 'classnames';

import { IFRAME_FEATURE_POLICY } from '../../constants';

interface ModalIframeProps extends IframeHTMLAttributes<HTMLIFrameElement> {
  title: string;
  className?: string;
}

export const SANDBOX_OPTIONS = [
  'allow-forms',
  'allow-modals',
  'allow-popups',
  'allow-popups-to-escape-sandbox',
  'allow-presentation',
  'allow-same-origin',
  'allow-scripts',
  'allow-top-navigation-by-user-activation',
].join(' ');

const ModalIframe = forwardRef<HTMLIFrameElement, ModalIframeProps>(
  ({
    title,
    className = '',
    ...props
  }, ref: ForwardedRef<HTMLIFrameElement>) => (
    <iframe
      title={title}
      className={classNames('modal-iframe', className)}
      allow={IFRAME_FEATURE_POLICY}
      referrerPolicy="origin"
      frameBorder="0"
      scrolling="no"
      ref={ref}
      role="dialog"
      sandbox={SANDBOX_OPTIONS}
      {...props}
    />
  ),
);

export default ModalIframe;
