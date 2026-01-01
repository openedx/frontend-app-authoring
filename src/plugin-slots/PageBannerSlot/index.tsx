import React, { ReactNode } from 'react';
import { PluginSlot } from '@openedx/frontend-plugin-framework';
import { PageBanner } from '@openedx/paragon';

export interface PageBannerSlotProps {
  show: boolean;
  onDismiss: () => void;
  children: ReactNode;
}

const PageBannerSlot: React.FC<PageBannerSlotProps> = ({
  show,
  onDismiss,
  children
}) => (
  <PluginSlot
    id="org.openedx.frontend.authoring.page_banner.v1"
    idAliases={['page_banner_slot']}
    pluginProps={{
      show, onDismiss
    }}
  >
    <div className="align-items-start">
      <PageBanner
        show={show}
        dismissible={true}
        onDismiss={onDismiss}
        variant={'light'}
        dismissAltText={'Close'}
      >
        {children}
      </PageBanner>
    </div>
  </PluginSlot>
);

export default PageBannerSlot;
