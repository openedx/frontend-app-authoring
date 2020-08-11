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
import { LibraryDetailPage, StudioHeader, LibraryListPage } from './library-authoring';
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
            <Route exact path="/" component={LibraryListPage} />
            <Route path="/library/:libraryId" component={LibraryDetailPage} />
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
