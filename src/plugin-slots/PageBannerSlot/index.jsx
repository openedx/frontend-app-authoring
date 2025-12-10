import React from 'react';
import PropTypes from 'prop-types';
import { PluginSlot } from '@openedx/frontend-plugin-framework';
import { PageBanner } from '@openedx/paragon';

/**
 * PageBannerSlot
 * A plugin slot that renders a Paragon PageBanner by default,
 * while allowing plugins to override the rendering.
 */
const PageBannerSlot = ({ show, dismissible, onDismiss, className, children }) => (
  <PluginSlot
    id="org.openedx.frontend.authoring.page_banner.v1"
    idAliases={["page_banner_slot"]}
    pluginProps={{ show, dismissible, onDismiss, className }}
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

PageBannerSlot.propTypes = {
  show: PropTypes.bool,
  dismissible: PropTypes.bool,
  onDismiss: PropTypes.func,
  className: PropTypes.string,
  children: PropTypes.node,
};

export default PageBannerSlot;
