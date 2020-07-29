import 'babel-polyfill';

import {
  APP_INIT_ERROR, APP_READY, subscribe, initialize,
} from '@edx/frontend-platform';
import { AppProvider, ErrorPage } from '@edx/frontend-platform/react';
import React from 'react';
import ReactDOM from 'react-dom';
import { Route, Switch } from 'react-router-dom';

import Header, { messages as headerMessages } from '@edx/frontend-component-header';
import Footer, { messages as footerMessages } from '@edx/frontend-component-footer';

import appMessages from './i18n';
import ExamplePage from './example/ExamplePage';
import ProctoredExamSettings from './proctored-exam-settings/ProctoredExamSettings';
import StudioHeader from './studio-header/Header';

import './index.scss';
import './assets/favicon.ico';

subscribe(APP_READY, () => {
  ReactDOM.render(
    <AppProvider>
      <Switch>
        <Route
          path="/proctored-exam-settings/:course_id"
          exact
          render={({ match }) => {
            const courseId = decodeURIComponent(match.params.course_id);
            return (
              <>
                <StudioHeader courseId={courseId} />
                <ProctoredExamSettings courseId={courseId} />
              </>
            );
          }}
        />
        <Route path="/example">
          <Header />
          <ExamplePage />
        </Route>
      </Switch>
      <Footer />
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
    headerMessages,
    footerMessages,
  ],
  requireAuthenticatedUser: true,
});
