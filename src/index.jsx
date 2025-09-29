/* eslint-disable no-console */
/* eslint-disable linebreak-style */
import {
  APP_INIT_ERROR, APP_READY, subscribe, initialize, mergeConfig, getConfig, getPath,
} from '@edx/frontend-platform';
import { AppProvider, ErrorPage } from '@edx/frontend-platform/react';
import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import {
  Route, createRoutesFromElements, createBrowserRouter, RouterProvider,
  Outlet,
} from 'react-router-dom';
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';

import { initializeHotjar } from '@edx/frontend-enterprise-hotjar';
import { logError } from '@edx/frontend-platform/logging';
// import { loadThemeStyles } from 'utils/themeService';
import MyCourses from 'my-courses/MyCourses';
import CreateWidgets from 'widgets-create/CreateWidgets';
import LibrariesV2Tab from 'studio-home/tabs-section/libraries-v2-tab';
import { configure, getMessages, IntlProvider } from '@edx/frontend-platform/i18n';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import Dashboard from './dashboard/Dashboard';
import messages from './i18n';

import {
  ComponentPicker,
  CreateLibrary,
  LibraryLayout,
  PreviewChangesEmbed,
} from './library-authoring';
import initializeStore from './store';
import CourseAuthoringRoutes from './CourseAuthoringRoutes';
import Head from './head/Head';
import { StudioHome } from './studio-home';
import CourseRerun from './course-rerun';
import { TaxonomyLayout, TaxonomyDetailPage, TaxonomyListPage } from './taxonomy';
import { ContentTagsDrawer } from './content-tags-drawer';
import AccessibilityPage from './accessibility-page';
import { ToastProvider } from './generic/toast-context';
import PageNotFound from './generic/PageNotFound';
import 'react-datepicker/dist/react-datepicker.css';
import './index.scss';
// eslint-disable-next-line import/no-unresolved
import Layout from './Layout';
// import './styles/global-overrides.scss';

// Import conditional styles CSS only
import './styles/conditional-styles.css';
import CustomCreateNewCourseForm from './studio-home/ps-course-form/CustomCreateNewCourseForm';
import registerFontAwesomeIcons from './utils/RegisterFontAwesome';
import Calendar from './calendar/pages/CalendarPage';
import AssignmentPage from './assignment/pages/AssignmentPage';
// import { getUIPreference } from './services/uiPreferenceService';
import * as Sentry from '@sentry/react';
import { dynamicTheme } from 'titaned-frontend-library';
try {
  const sentryresponse = await getAuthenticatedHttpClient().get(`${getConfig().STUDIO_BASE_URL}/titaned/api/v1/menu-config/`);
  Sentry.init({
    dsn: sentryresponse.data.sentry.dsn,
    environment: sentryresponse.data.sentry.environment,
    tracesSampleRate: sentryresponse.data.sentry.traces_sample_rate,
    sendDefaultPii: sentryresponse.data.sentry.send_default_pii,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration(),
    ],
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  });
} catch (error) {
  console.error('API call failed, fro sentry:', error);
}

// Load styles only for new UI
const loadStylesForNewUI = (isOldUI) => {
  console.log('loadStylesForNewUI called with isOldUI:', isOldUI);
  document.body.className = isOldUI ? 'old-ui' : 'new-ui';
  document.documentElement.className = isOldUI ? 'old-ui' : 'new-ui';
  console.log('Body className set to:', document.body.className);
  console.log('Html className set to:', document.documentElement.className);

  if (!isOldUI) {
    console.log('Loading titaned-frontend-library styles...');
    import('titaned-frontend-library/dist/index.css');
    import('./styles/styles-overrides.scss');
  } else {
    console.log('Skipping titaned-frontend-library styles for old UI');
  }
};

const queryClient = new QueryClient();

registerFontAwesomeIcons();

const App = () => {
  const [oldUI, setOldUI] = useState(null);
  const [loading, setLoading] = useState(true);
  const [menuConfig, setMenuConfig] = useState(null);
  console.log('oldUI in Index', oldUI);

  // Load UI preference and menu config in one API call to avoid race conditions
  useEffect(() => {
    const loadUIPreferenceAndMenuConfig = async () => {
      try {
        // First, load from localStorage for immediate display
        const localStorageValue = localStorage.getItem('oldUI') || 'false';
        console.log('Initial localStorage oldUI:', localStorageValue);
        setOldUI(localStorageValue);
        setLoading(false);

        // Then, fetch both UI preference and menu config in one API call
        console.log('Fetching menu config and UI preference...');
        const response = await getAuthenticatedHttpClient().get(`${getConfig().STUDIO_BASE_URL}/titaned/api/v1/menu-config/`);

        if (response.status === 200 && response.data) {
          console.log('Menu config:', response.data);
          setMenuConfig(response.data);

          // Extract UI preference from the same response
          const useNewUI = response.data.use_new_ui === true;
          const apiOldUIValue = !useNewUI ? 'true' : 'false';
          console.log('API returned use_new_ui:', useNewUI, 'API oldUI:', apiOldUIValue);

          // Check if API response matches localStorage
          if (localStorageValue !== apiOldUIValue) {
            console.log('Mismatch detected! localStorage:', localStorageValue, 'API:', apiOldUIValue);
            console.log('Updating localStorage and reloading page...');
            localStorage.setItem('oldUI', apiOldUIValue);
            // Reload page to re-run build-time config with correct localStorage
            window.location.reload();
            return;
          }

          console.log('localStorage and API are in sync, no reload needed');
        } else {
          console.warn('API failed, using localStorage value and default menu config');
          setMenuConfig({}); // Set empty object as fallback
        }
      } catch (error) {
        console.error('API call failed, using localStorage value and default menu config:', error);
        setMenuConfig({}); // Set empty object as fallback
      }
    };

    loadUIPreferenceAndMenuConfig();
  }, []);

  // Apply theme from JSON
  useEffect(() => {
    if (oldUI === 'false') {
      (async () => {
        try {
          const response = await getAuthenticatedHttpClient().get(`${getConfig().STUDIO_BASE_URL}/titaned/api/v1/menu-config/`);
          dynamicTheme(response);
        } catch (error) {
          console.error('Error fetching theme config:', error);
        }
      })();
    }
  }, [oldUI]);

  useEffect(() => {
    // Only load styles after we know the UI preference
    if (oldUI !== null) {
      loadStylesForNewUI(oldUI === 'true');
    }

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
  }, [oldUI]); // Add oldUI as dependency

  // Note: uiModeChanged event listener removed because UI switching actions
  // (Header.tsx and Layout.jsx) immediately reload/redirect the page after
  // dispatching the event, making the event listener redundant.

  // Show loading screen while UI preference is being fetched
  if (loading || menuConfig === null) {
    return (
      <div className="d-flex justify-content-center align-items-center flex-column vh-100">
        <div>Loading.. Please wait...</div>
      </div>
    );
  }

  console.log('Rendering app with oldUI:', oldUI);

  const router = createBrowserRouter(
    createRoutesFromElements(
      <>
        <Route element={oldUI !== 'true' ? <Layout /> : <Outlet />}>
          <Route path="/home" element={oldUI !== 'true' ? <Dashboard /> : <StudioHome />} />
          {/* <Route path="/home" element={<StudioHome />} /> */}
          {/* <Route path="/widgets-create" element={<CreateWidgets />} /> */}
          {oldUI === 'false' && (
            <Route path="/my-courses" element={<MyCourses />} />
          )}
          {/* <Route path="/libraries" element={<LibrariesV2Tab />} /> */}
          {oldUI === 'true' ? (
            <Route path="/libraries" element={<StudioHome />} />
          ) : (
            <Route path="/libraries" element={<LibrariesV2Tab />} />
          )}
          <Route path="/libraries-v1" element={<StudioHome />} />
          <Route path="/library/create" element={<CreateLibrary />} />
          <Route path="/library/:libraryId/*" element={<LibraryLayout />} />
          <Route path="/component-picker" element={<ComponentPicker />} />
          {menuConfig?.enable_calendar && oldUI === 'false' && (
            <Route path="/calendar" element={<Calendar />} />
          )}
          {menuConfig?.enable_assignments && oldUI === 'false' && (
            <Route path="/assignments" element={<AssignmentPage />} />
          )}
          <Route
            path="/component-picker/multiple"
            element={<ComponentPicker componentPickerMode="multiple" />}
          />
          <Route
            path="/legacy/preview-changes/:usageKey"
            element={<PreviewChangesEmbed />}
          />
          <Route path="/course/:courseId/*" element={<CourseAuthoringRoutes />} />
          <Route path="/course_rerun/:courseId" element={<CourseRerun />} />
          {menuConfig?.allow_to_create_new_course && oldUI === 'false' && (
            <Route path="/new-course" element={<CustomCreateNewCourseForm />} />
          )}
          {getConfig().ENABLE_ACCESSIBILITY_PAGE === 'true' && (
            <Route path="/accessibility" element={<AccessibilityPage />} />
          )}
          {getConfig().ENABLE_TAGGING_TAXONOMY_PAGES === 'true' && (
            <>
              <Route path="/taxonomies" element={<TaxonomyLayout />}>
                <Route index element={<TaxonomyListPage />} />
              </Route>
              <Route path="/taxonomy" element={<TaxonomyLayout />}>
                <Route
                  path="/taxonomy/:taxonomyId"
                  element={<TaxonomyDetailPage />}
                />
              </Route>
              <Route
                path="/tagging/components/widget/:contentId"
                element={<ContentTagsDrawer />}
              />
            </>
          )}
        </Route>
        {/* Catch-all route for 404 errors - outside Layout for full page */}
        <Route path="*" element={<PageNotFound />} />
      </>,
    ),
    {
      basename: getPath(getConfig().PUBLIC_PATH),
    },
  );

  return (
    <AppProvider store={initializeStore()} wrapWithRouter={false}>
      <ToastProvider>
        <QueryClientProvider client={queryClient}>
          <Head />
          <RouterProvider router={router} />
        </QueryClientProvider>
      </ToastProvider>
    </AppProvider>
  );
};

configure({
  messages,
  config: getConfig(),
  // loggingService: { logError, logInfo: console.info },
});

subscribe(APP_READY, async () => {
  // const themeData = await loadThemeStyles();
  ReactDOM.render(
    <IntlProvider locale={getConfig().language || 'en'} messages={getMessages()}>
      <App />
    </IntlProvider>,
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
        LMS_BASE_URL: process.env.LMS_BASE_URL || null,
        EXAMS_BASE_URL: process.env.EXAMS_BASE_URL || null,
        CALCULATOR_HELP_URL: process.env.CALCULATOR_HELP_URL || null,
        ENABLE_PROGRESS_GRAPH_SETTINGS: process.env.ENABLE_PROGRESS_GRAPH_SETTINGS || 'false',
        ENABLE_TEAM_TYPE_SETTING: process.env.ENABLE_TEAM_TYPE_SETTING === 'true',
        ENABLE_OPEN_MANAGED_TEAM_TYPE: process.env.ENABLE_OPEN_MANAGED_TEAM_TYPE === 'true',
        BBB_LEARN_MORE_URL: process.env.BBB_LEARN_MORE_URL || '',
        STUDIO_BASE_URL: process.env.STUDIO_BASE_URL || null,
        STUDIO_SHORT_NAME: process.env.STUDIO_SHORT_NAME || null,
        TERMS_OF_SERVICE_URL: process.env.TERMS_OF_SERVICE_URL || null,
        PRIVACY_POLICY_URL: process.env.PRIVACY_POLICY_URL || null,
        ENABLE_ACCESSIBILITY_PAGE: process.env.ENABLE_ACCESSIBILITY_PAGE || 'false',
        NOTIFICATION_FEEDBACK_URL: process.env.NOTIFICATION_FEEDBACK_URL || null,
        ENABLE_UNIT_PAGE: process.env.ENABLE_UNIT_PAGE || 'false',
        ENABLE_ASSETS_PAGE: process.env.ENABLE_ASSETS_PAGE || 'false',
        ENABLE_VIDEO_UPLOAD_PAGE_LINK_IN_CONTENT_DROPDOWN: process.env.ENABLE_VIDEO_UPLOAD_PAGE_LINK_IN_CONTENT_DROPDOWN || 'false',
        ENABLE_CERTIFICATE_PAGE: process.env.ENABLE_CERTIFICATE_PAGE || 'false',
        ENABLE_TAGGING_TAXONOMY_PAGES: process.env.ENABLE_TAGGING_TAXONOMY_PAGES || 'false',
        ENABLE_HOME_PAGE_COURSE_API_V2: process.env.ENABLE_HOME_PAGE_COURSE_API_V2 === 'true',
        ENABLE_CHECKLIST_QUALITY: process.env.ENABLE_CHECKLIST_QUALITY || 'true',
        ENABLE_GRADING_METHOD_IN_PROBLEMS: process.env.ENABLE_GRADING_METHOD_IN_PROBLEMS === 'true',
        LIBRARY_SUPPORTED_BLOCKS: (process.env.LIBRARY_SUPPORTED_BLOCKS || 'problem,video,html').split(','),
      }, 'CourseAuthoringConfig');
    },
  },
  messages,
  requireAuthenticatedUser: true,
});
