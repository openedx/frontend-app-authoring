// eslint-disable-next-line
import 'core-js/stable';
import 'regenerator-runtime/runtime';

import React from 'react';
import ReactDOM from 'react-dom';
import { IntlProvider } from 'react-intl';

import messages from './i18n';
import './index.scss';
import App from './App';

ReactDOM.render(
  <IntlProvider locale="en" messages={messages}>
    <App />
  </IntlProvider>,
  document.getElementById('root'),
);
