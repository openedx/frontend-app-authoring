import 'core-js/stable';
import 'regenerator-runtime/runtime';
import React from 'react';
import ReactDOM from 'react-dom';
import { Route, Routes, Outlet } from 'react-router-dom';
import {
  APP_INIT_ERROR, APP_READY, initialize, mergeConfig, subscribe,
} from '@edx/frontend-platform';
import { AppProvider, ErrorPage } from '@edx/frontend-platform/react';
import { Footer } from '@edx/frontend-lib-content-components';
import messages from './i18n';
import store from './store';
import { NotFoundPage } from './generic';
import {
  ROUTES,
  CourseImportPage,
  LibraryBlockPage,
  LibraryEditPage,
  LibraryListPage,
  LibraryCreatePage,
  LibraryAccessPage,
  LibraryAuthoringPage,
  StudioHeaderWrapper,
} from './library-authoring';
import './index.scss';

mergeConfig({
  LIB_AUTHORING_BASE_URL: process.env.BASE_URL,
  STUDIO_BASE_URL: process.env.STUDIO_BASE_URL,
  LOGO_URL: process.env.LOGO_TRADEMARK_URL,
  BLOCKSTORE_COLLECTION_UUID: process.env.BLOCKSTORE_COLLECTION_UUID,
  SECURE_ORIGIN_XBLOCK_BOOTSTRAP_HTML_URL: process.env.SECURE_ORIGIN_XBLOCK_BOOTSTRAP_HTML_URL,
});

subscribe(APP_READY, () => {
  ReactDOM.render(
    <AppProvider store={store}>
      <Routes>
        <Route path={`${ROUTES.Detail.HOME}/*`} element={<StudioHeaderWrapper />} />
        <Route path="*" element={<StudioHeaderWrapper />} />
      </Routes>
      <Routes>
        <Route element={(
          <main className="library-authoring__main-content">
            <Outlet />
          </main>
          )}
        >
          <Route path={ROUTES.List.HOME} element={<LibraryListPage />} />
          <Route path={ROUTES.List.CREATE} element={<LibraryCreatePage />} />
          <Route path={ROUTES.Detail.HOME} element={<LibraryAuthoringPage />} />
          <Route path={ROUTES.Detail.EDIT} element={<LibraryEditPage />} />
          <Route path={ROUTES.Detail.ACCESS} element={<LibraryAccessPage />} />
          <Route path={ROUTES.Detail.IMPORT} element={<CourseImportPage />} />
          <Route path={`${ROUTES.Block.HOME}/*`} element={<LibraryBlockPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
      <div className="mt-6">
        <Footer
          marketingBaseUrl={process.env.MARKETING_SITE_BASE_URL}
          termsOfServiceUrl={process.env.TERMS_OF_SERVICE_URL}
          privacyPolicyUrl={process.env.PRIVACY_POLICY_URL}
          supportEmail={process.env.SUPPORT_EMAIL}
          platformName={process.env.SITE_NAME}
          lmsBaseUrl={process.env.LMS_BASE_URL}
          studioBaseUrl={process.env.STUDIO_BASE_URL}
          showAccessibilityPage={process.env.ENABLE_ACCESSIBILITY_PAGE === 'true'}
        />
      </div>
    </AppProvider>,
    document.getElementById('root'),
  );
});

subscribe(APP_INIT_ERROR, (error) => {
  ReactDOM.render(<ErrorPage message={error.message} />, document.getElementById('root'));
});

initialize({
  messages,
  requireAuthenticatedUser: true,
});
