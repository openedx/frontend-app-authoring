// @ts-check
import React, { useMemo, useState } from 'react';
import { StudioFooter } from '@edx/frontend-component-footer';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Outlet, ScrollRestoration } from 'react-router-dom';
import { Toast } from '@edx/paragon';

import AlertMessage from '../generic/alert-message';
import Header from '../header';
import { TaxonomyContext } from './common/context';
import messages from './messages';

const TaxonomyLayout = () => {
  const intl = useIntl();
  // Use `setToastMessage` to show the toast.
  const [toastMessage, setToastMessage] = useState(/** @type{null|string} */ (null));
  // Use `setToastMessage` to show the alert.
  const [alertProps, setAlertProps] = useState(/** @type {null|import('./common/context').AlertProps} */ (null));

  const context = useMemo(() => ({
    toastMessage, setToastMessage, alertProps, setAlertProps,
  }), []);

  return (
    <TaxonomyContext.Provider value={context}>
      <div className="bg-light-400">
        <Header isHiddenMainMenu />
        { alertProps && (
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
        <StudioFooter />
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
