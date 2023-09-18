import 'core-js/stable';
import 'regenerator-runtime/runtime';
import React from 'react';
import ReactDOM from 'react-dom';
import { Route, Switch } from 'react-router-dom';
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
      <Switch>
        <Route path={ROUTES.Detail.HOME} component={StudioHeaderWrapper} />
        <Route path="*" component={StudioHeaderWrapper} />
      </Switch>
      <main className="library-authoring__main-content">
        <Switch>
          <Route exact path={ROUTES.List.HOME} component={LibraryListPage} />
          <Route exact path={ROUTES.List.CREATE} component={LibraryCreatePage} />
          <Route exact path={ROUTES.Detail.HOME} component={LibraryAuthoringPage} />
          <Route exact path={ROUTES.Detail.EDIT} component={LibraryEditPage} />
          <Route exact path={ROUTES.Detail.ACCESS} component={LibraryAccessPage} />
          <Route exact path={ROUTES.Detail.IMPORT} component={CourseImportPage} />
          <Route exact path={ROUTES.Block.HOME} component={LibraryBlockPage} />
          <Route exact path={ROUTES.Block.EDIT} component={LibraryBlockPage} />
          <Route exact path={ROUTES.Block.ASSETS} component={LibraryBlockPage} />
          <Route exact path={ROUTES.Block.SOURCE} component={LibraryBlockPage} />
          <Route exact path={ROUTES.Block.LEARN} component={LibraryBlockPage} />
          <Route path="*" component={NotFoundPage} />
        </Switch>
      </main>
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
