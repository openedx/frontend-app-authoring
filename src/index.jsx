import 'core-js/stable';
import 'regenerator-runtime/runtime';

import {
  APP_INIT_ERROR, APP_READY, subscribe, initialize, mergeConfig,
} from '@edx/frontend-platform';
import { AppProvider, ErrorPage } from '@edx/frontend-platform/react';
import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import {
  Navigate, Route, createRoutesFromElements, createBrowserRouter, RouterProvider,
} from 'react-router-dom';
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';

import { initializeHotjar } from '@edx/frontend-enterprise-hotjar';
import { logError } from '@edx/frontend-platform/logging';
import messages from './i18n';

import initializeStore from './store';
import CourseAuthoringRoutes from './CourseAuthoringRoutes';
import Head from './head/Head';
import { StudioHome } from './studio-home';
import CourseRerun from './course-rerun';
import { TaxonomyLayout, TaxonomyDetailPage, TaxonomyListPage } from './taxonomy';
import { ContentTagsDrawer } from './content-tags-drawer';
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

import 'react-datepicker/dist/react-datepicker.css';
import './index.scss';

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    if (process.env.HOTJAR_APP_ID) {
      try {
        initializeHotjar({
          hotjarId: process.env.HOTJAR_APP_ID,
          hotjarVersion: process.env.HOTJAR_VERSION,
          hotjarDebug: !!process.env.HOTJAR_DEBUG,
        });
      } catch (error) {
        logError(error);
      }
    }
  }, []);

  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route>
        <Route path="/home" element={<StudioHome />} />
        <Route path="/course/:courseId/*" element={<CourseAuthoringRoutes />} />
        <Route path="/course_rerun/:courseId" element={<CourseRerun />} />
        {process.env.ENABLE_TAGGING_TAXONOMY_PAGES === 'true' && (
          <>
            {/* TODO: remove this redirect once Studio's link is updated */}
            <Route path="/taxonomy-list" element={<Navigate to="/taxonomies" />} />
            <Route path="/taxonomies" element={<TaxonomyLayout />}>
              <Route index element={<TaxonomyListPage />} />
            </Route>
            <Route path="/taxonomy" element={<TaxonomyLayout />}>
              <Route path="/taxonomy/:taxonomyId" element={<TaxonomyDetailPage />} />
            </Route>
            <Route
              path="/tagging/components/widget/:contentId"
              element={<ContentTagsDrawer />}
            />
          </>
        )}
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
      </Route>,
    ),
  );

  return (
    <AppProvider store={initializeStore()} wrapWithRouter={false}>
      <QueryClientProvider client={queryClient}>
        <Head />
        <RouterProvider router={router} />
      </QueryClientProvider>
    </AppProvider>
  );
};

subscribe(APP_READY, () => {
  ReactDOM.render(
    (<App />),
    document.getElementById('root'),
  );
});

subscribe(APP_INIT_ERROR, (error) => {
  ReactDOM.render(<ErrorPage message={error.message} />, document.getElementById('root'));
});

initialize({
  handlers: {
    config: () => {
      mergeConfig({
        SUPPORT_URL: process.env.SUPPORT_URL || null,
        SUPPORT_EMAIL: process.env.SUPPORT_EMAIL || null,
        LEARNING_BASE_URL: process.env.LEARNING_BASE_URL,
        EXAMS_BASE_URL: process.env.EXAMS_BASE_URL || null,
        CALCULATOR_HELP_URL: process.env.CALCULATOR_HELP_URL || null,
        ENABLE_PROGRESS_GRAPH_SETTINGS: process.env.ENABLE_PROGRESS_GRAPH_SETTINGS || 'false',
        ENABLE_TEAM_TYPE_SETTING: process.env.ENABLE_TEAM_TYPE_SETTING === 'true',
        BBB_LEARN_MORE_URL: process.env.BBB_LEARN_MORE_URL || '',
        STUDIO_BASE_URL: process.env.STUDIO_BASE_URL || null,
        STUDIO_SHORT_NAME: process.env.STUDIO_SHORT_NAME || null,
        TERMS_OF_SERVICE_URL: process.env.TERMS_OF_SERVICE_URL || null,
        PRIVACY_POLICY_URL: process.env.PRIVACY_POLICY_URL || null,
        SHOW_ACCESSIBILITY_PAGE: process.env.SHOW_ACCESSIBILITY_PAGE || false,
        NOTIFICATION_FEEDBACK_URL: process.env.NOTIFICATION_FEEDBACK_URL || null,
        LIB_AUTHORING_BASE_URL: process.env.BASE_URL,
        LOGO_URL: process.env.LOGO_URL,
        BLOCKSTORE_COLLECTION_UUID: process.env.BLOCKSTORE_COLLECTION_UUID,
        SECURE_ORIGIN_XBLOCK_BOOTSTRAP_HTML_URL: process.env.SECURE_ORIGIN_XBLOCK_BOOTSTRAP_HTML_URL,
        SITE_NAME: process.env.SITE_NAME,
        LOGOUT_URL: process.env.LOGOUT_URL,
        LOGIN_URL: process.env.LOGIN_URL,
        LMS_BASE_URL: process.env.LMS_BASE_URL,
        MARKETING_SITE_BASE_URL: process.env.MARKETING_SITE_BASE_URL,
      }, 'CourseAuthoringConfig');
    },
  },
  messages,
  requireAuthenticatedUser: true,
});
