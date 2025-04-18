import { useMemo, useState } from 'react';
import { StudioFooterSlot } from '@edx/frontend-component-footer';
import { Outlet, ScrollRestoration } from 'react-router-dom';
import { Toast } from '@openedx/paragon';

import AlertError, { type AlertErrorProps } from '../generic/alert-error';
import Header from '../header';
import { TaxonomyContext } from './common/context';

export const TaxonomyLayout = () => {
  // Use `setToastMessage` to show the toast.
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  // Use `setToastMessage` to show the alert.
  const [alertError, setAlertError] = useState<AlertErrorProps | null>(null);

  const context = useMemo(() => ({
    toastMessage, setToastMessage, alertError, setAlertError,
  }), []);

  return (
    <TaxonomyContext.Provider value={context}>
      <div className="bg-light-400">
        <Header isHiddenMainMenu />
        { alertError && (
          <AlertError
            {...alertError}
            onDismiss={() => setAlertError(null)}
          />
        )}
        <Outlet />
        <StudioFooterSlot />
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
