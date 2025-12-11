import React, { ReactNode } from 'react';
import { PluginSlot } from '@openedx/frontend-plugin-framework';
import { PageBanner } from '@openedx/paragon';

export interface PageBannerSlotProps {
  show?: boolean;
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
  children?: ReactNode;
}

const PageBannerSlot: React.FC<PageBannerSlotProps> = ({
  show,
  dismissible,
  onDismiss,
  className,
  children,
}) => (
  <PluginSlot
    id="org.openedx.frontend.authoring.page_banner.v1"
    idAliases={['page_banner_slot']}
    pluginProps={{
      show, dismissible, onDismiss, className,
    }}
  >
    <PageBanner
      show={show}
      dismissible={dismissible}
      onDismiss={onDismiss}
      className={className}
    >
      {children}
    </PageBanner>
  </PluginSlot>
);

export default PageBannerSlot;
