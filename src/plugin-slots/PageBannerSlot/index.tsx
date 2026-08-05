import React, { ReactNode } from 'react';
import { PluginSlot } from '@openedx/frontend-plugin-framework';
import { PageBanner } from '@openedx/paragon';

export interface PageBannerSlotProps {
  show: boolean;
  onDismiss: () => void;
  children: ReactNode;
  lmsLinkForAboutPage?: string;
  courseDisplayName?: string;
  platformName?: string;
}

const PageBannerSlot: React.FC<PageBannerSlotProps> = ({
  show,
  onDismiss,
  children,
  lmsLinkForAboutPage,
  courseDisplayName,
  platformName,
}) => (
  <PluginSlot
    id="org.openedx.frontend.authoring.page_banner.v1"
    idAliases={['page_banner_slot']}
    pluginProps={{
      show,
      onDismiss,
      lmsLinkForAboutPage,
      courseDisplayName,
      platformName,
    }}
  >
    <div className="align-items-start">
      <PageBanner
        show={show}
        dismissible
        onDismiss={onDismiss}
        variant="light"
        dismissAltText="Close"
      >
        {children}
      </PageBanner>
    </div>
  </PluginSlot>
);

export default PageBannerSlot;
