// @ts-check
import React, { useMemo, useState } from 'react';
import { StudioFooter } from '@edx/frontend-component-footer';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Outlet, ScrollRestoration } from 'react-router-dom';
import { Toast } from '@openedx/paragon';
import { PluginSlot } from '@openedx/frontend-plugin-framework';
import AlertMessage from '../generic/alert-message';
import Header from '../header';
import { TaxonomyContext } from './common/context';
import messages from './messages';

const TaxonomyLayout = () => {
  const intl = useIntl();
  // Use `setToastMessage` to show the toast.
  const [toastMessage, setToastMessage] = useState(/** @type{null|string} */(null));
  // Use `setToastMessage` to show the alert.
  const [alertProps, setAlertProps] = useState(/** @type {null|import('./common/context').AlertProps} */(null));

  const context = useMemo(() => ({
    toastMessage, setToastMessage, alertProps, setAlertProps,
  }), []);

  return (
    <TaxonomyContext.Provider value={context}>
      <div>
        <PluginSlot id="header_plugin_slot">
          <Header isHiddenMainMenu />
        </PluginSlot>
        {alertProps && (
          <AlertMessage
            data-testid="taxonomy-alert"
            className="mb-0"
            dismissible
            closeLabel={intl.formatMessage(messages.taxonomyDismissLabel)}
            onClose={() => setAlertProps(null)}
            {...alertProps}
          />
        )}
        <Outlet />
        <PluginSlot id="footer_plugin_slot">
          <StudioFooter />
        </PluginSlot>
        {toastMessage && (
          <Toast
            show
            onClose={() => setToastMessage(null)}
            data-testid="taxonomy-toast"
          >
            {toastMessage}
          </Toast>
        )}
      </div>
      <ScrollRestoration />
    </TaxonomyContext.Provider>
  );
};

export default TaxonomyLayout;
