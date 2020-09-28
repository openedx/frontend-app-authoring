import 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import { Route, Switch } from 'react-router-dom';
import {
  APP_INIT_ERROR, APP_READY, initialize, mergeConfig, subscribe,
} from '@edx/frontend-platform';
import { AppProvider, ErrorPage } from '@edx/frontend-platform/react';
import Footer, { messages as footerMessages } from '@edx/frontend-component-footer';

import appMessages from './i18n';
import store from './store';
import { NotFoundPage } from './generic';
import {
  ROUTES,
  LibraryBlockPage,
  LibraryEditPage,
  LibraryPage,
  LibraryListPage,
  StudioHeader,
  LibraryAccessPage,
} from './library-authoring';
import './index.scss';
import './assets/favicon.ico';

mergeConfig({
  STUDIO_BASE_URL: process.env.STUDIO_BASE_URL,
  BLOCKSTORE_COLLECTION_UUID: process.env.BLOCKSTORE_COLLECTION_UUID,
});

subscribe(APP_READY, () => {
  ReactDOM.render(
    <AppProvider store={store}>
      <div className="wrapper">
        <StudioHeader />
        <main>
          <Switch>
            <Route exact path={ROUTES.List.HOME} component={LibraryListPage} />
            <Route exact path={ROUTES.Detail.HOME} component={LibraryPage} />
            <Route exact path={ROUTES.Detail.EDIT} component={LibraryEditPage} />
            <Route exact path={ROUTES.Detail.ACCESS} component={LibraryAccessPage} />
            <Route exact path={ROUTES.Block.HOME} component={LibraryBlockPage} />
            <Route exact path={ROUTES.Block.EDIT} component={LibraryBlockPage} />
            <Route exact path={ROUTES.Block.ASSETS} component={LibraryBlockPage} />
            <Route exact path={ROUTES.Block.SOURCE} component={LibraryBlockPage} />
            <Route exact path={ROUTES.Block.LEARN} component={LibraryBlockPage} />
            <Route path="*" component={NotFoundPage} />
          </Switch>
        </main>
        <Footer />
      </div>
    </AppProvider>,
    document.getElementById('root'),
  );
});

subscribe(APP_INIT_ERROR, (error) => {
  ReactDOM.render(<ErrorPage message={error.message} />, document.getElementById('root'));
});

initialize({
  messages: [
    appMessages,
    footerMessages,
  ],
  requireAuthenticatedUser: true,
});
