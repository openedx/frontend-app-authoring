import { forwardRef, ForwardedRef, IframeHTMLAttributes } from 'react';
import classNames from 'classnames';

import { IFRAME_FEATURE_POLICY, SANDBOX_OPTIONS } from '../../constants';

interface ModalIframeProps extends IframeHTMLAttributes<HTMLIFrameElement> {
  title: string;
  className?: string;
  labelledBy?: string;
  describedBy?: string;
}

const ModalIframe = forwardRef<HTMLIFrameElement, ModalIframeProps>(
  ({
    title, className, labelledBy, describedBy, ...props
  }, ref: ForwardedRef<HTMLIFrameElement>) => (
    <iframe
      title={title}
      className={classNames('modal-iframe', className)}
      data-testid="modal-iframe"
      allow={IFRAME_FEATURE_POLICY}
      referrerPolicy="origin"
      frameBorder="0"
      scrolling="no"
      ref={ref}
      sandbox={SANDBOX_OPTIONS}
      aria-modal="true"
      role="dialog"
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      {...props}
    />
  ),
);

ModalIframe.defaultProps = {
  className: 'modal-iframe',
  labelledBy: 'modal-title',
  describedBy: 'modal-description',
};

export default ModalIframe;
