import React, { useMemo, useState } from 'react';
import { StudioFooter } from '@edx/frontend-component-footer';
import { Outlet, ScrollRestoration } from 'react-router-dom';
import { Toast } from '@edx/paragon';

import Header from '../header';
import { TaxonomyContext } from './common/context';

const TaxonomyLayout = () => {
  // Use `setToastMessage` to show the toast.
  const [toastMessage, setToastMessage] = useState(null);

  const context = useMemo(() => ({
    toastMessage, setToastMessage,
  }), []);

  return (
    <TaxonomyContext.Provider value={context}>
      <div className="bg-light-400">
        <Header isHiddenMainMenu />
        <Outlet />
        <StudioFooter />
        {toastMessage && (
          <Toast
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
