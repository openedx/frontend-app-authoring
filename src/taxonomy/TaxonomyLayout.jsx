// @ts-check
import React, { useMemo, useState } from 'react';
import { StudioFooter } from '@edx/frontend-component-footer';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Toast } from '@edx/paragon';
import { Outlet } from 'react-router-dom';

import AlertMessage from '../generic/alert-message';
import Header from '../header';
import { TaxonomyContext } from './common/context';
import messages from './messages';

const TaxonomyLayout = () => {
  const intl = useIntl();
  // Use `setToastMessage` to show the toast.
  const [toastMessage, setToastMessage] = useState(null);
  const [alertProps, setAlertProps] = useState(null);

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
        <Toast
          show={toastMessage !== null}
          onClose={() => setToastMessage(null)}
          data-testid="taxonomy-toast"
        >
          {toastMessage}
        </Toast>
      </div>
    </TaxonomyContext.Provider>
  );
};

export default TaxonomyLayout;
