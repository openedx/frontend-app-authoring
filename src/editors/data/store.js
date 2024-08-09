import * as redux from 'redux';
import thunkMiddleware from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension/logOnlyInProduction';
import { createLogger } from 'redux-logger';

import reducer, { actions, selectors } from './redux';

export const createStore = () => {
  const loggerMiddleware = createLogger();

  const middleware = [thunkMiddleware, loggerMiddleware];

  const store = redux.createStore(
    reducer,
    composeWithDevTools(redux.applyMiddleware(...middleware)),
  );

  /**
   * Dev tools for redux work
   */
  if (process.env.NODE_ENV === 'development') {
    window.store = store;
    window.actions = actions;
    window.selectors = selectors;
  }

  return store;
};

const store = createStore();

export default store;
