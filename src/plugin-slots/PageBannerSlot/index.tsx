import React, { ReactNode } from 'react';
import { PluginSlot } from '@openedx/frontend-plugin-framework';
import { PageBanner } from '@openedx/paragon';

export interface PageBannerSlotProps {
  show: boolean;
  dismissible: boolean;
  onDismiss: () => void;
  className: string;
  children: ReactNode;
  variant?: string;
  dismissAltText?: string;
}

const PageBannerSlot: React.FC<PageBannerSlotProps> = ({
  show,
  dismissible,
  onDismiss,
  className,
  children,
  variant = 'info',
  dismissAltText = 'Dismiss',
}) => (
  <PluginSlot
    id="org.openedx.frontend.authoring.page_banner.v1"
    idAliases={['page_banner_slot']}
    pluginProps={{
      show, dismissible, onDismiss, className, variant, dismissAltText,
    }}
  >
    <div className={className}>
      <PageBanner
        show={show}
        dismissible={dismissible}
        onDismiss={onDismiss}
        variant={variant as any}
        dismissAltText={dismissAltText}
      >
        {children}
      </PageBanner>
    </div>
  </PluginSlot>
);

export default PageBannerSlot;
