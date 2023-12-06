import 'core-js/stable';
import 'regenerator-runtime/runtime';
import React from 'react';
import { Route, Routes, Outlet } from 'react-router-dom';
import { mergeConfig } from '@edx/frontend-platform';
import { NotFoundPage } from './generic';

import { ROUTES } from './common';
import { CourseImportPage } from '../library-course-import';
import { LibraryBlockPage } from '../edit-library-block';
import { LibraryEditPage } from '../configure-library';
import { LibraryListPage } from '../list-libraries';
import { LibraryCreatePage } from '../create-library';
import { LibraryAccessPage } from '../library-access';
import { LibraryAuthoringPage } from '../author-library';
import './index.scss';

mergeConfig({
  LIB_AUTHORING_BASE_URL: process.env.BASE_URL,
  STUDIO_BASE_URL: process.env.STUDIO_BASE_URL,
  LOGO_URL: process.env.LOGO_URL,
  BLOCKSTORE_COLLECTION_UUID: process.env.BLOCKSTORE_COLLECTION_UUID,
  SECURE_ORIGIN_XBLOCK_BOOTSTRAP_HTML_URL: process.env.SECURE_ORIGIN_XBLOCK_BOOTSTRAP_HTML_URL,
  SITE_NAME: process.env.SITE_NAME,
  LOGOUT_URL: process.env.LOGOUT_URL,
  LOGIN_URL: process.env.LOGIN_URL,
  LMS_BASE_URL: process.env.LMS_BASE_URL,
  MARKETING_SITE_BASE_URL: process.env.MARKETING_SITE_BASE_URL,
  TERMS_OF_SERVICE_URL: process.env.TERMS_OF_SERVICE_URL,
  PRIVACY_POLICY_URL: process.env.PRIVACY_POLICY_URL,
  SUPPORT_EMAIL: process.env.SUPPORT_EMAIL,
  SHOW_ACCESSIBILITY_PAGE: process.env.SHOW_ACCESSIBILITY_PAGE,
});

// const libraryAuthoringRoutes = (
//   <>
//     <Route path={ROUTES.List.HOME} element={<LibraryListPage />} />
//     <Route path={ROUTES.List.CREATE} element={<LibraryCreatePage />} />
//     <Route path={ROUTES.Detail.HOME} element={<LibraryAuthoringPage />} />
//     <Route path={ROUTES.Detail.EDIT} element={<LibraryEditPage />} />
//     <Route path={ROUTES.Detail.ACCESS} element={<LibraryAccessPage />} />
//     <Route path={ROUTES.Detail.IMPORT} element={<CourseImportPage />} />
//     <Route path={`${ROUTES.Block.HOME}/*`} element={<LibraryBlockPage />} />
//   </>
// );

const libraryAuthoringRoutes = (
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
);

// subscribe(APP_READY, () => {
//   ReactDOM.render(
//     <AppProvider store={store}>
//       <Routes>
//         <Route path={`${ROUTES.Detail.HOME}/*`} element={<StudioHeaderWrapper />} />
//         <Route path="*" element={<StudioHeaderWrapper />} />
//       </Routes>
//       {libraryAuthoringRoutes}
//       <StudioFooter />
//     </AppProvider>,
//     document.getElementById('root'),
//   );
// });

// subscribe(APP_INIT_ERROR, (error) => {
//   ReactDOM.render(<ErrorPage message={error.message} />, document.getElementById('root'));
// });

// initialize({
//   messages,
//   requireAuthenticatedUser: true,
// });

// eslint-disable-next-line import/prefer-default-export
export {
  LibraryAuthoringPage, LibraryListPage, ROUTES as LIBRARY_AUTHORING_ROUTES, libraryAuthoringRoutes,
};
