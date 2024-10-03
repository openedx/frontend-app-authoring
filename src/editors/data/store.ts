import * as redux from 'redux';
import thunkMiddleware from 'redux-thunk';
import { composeWithDevToolsLogOnlyInProduction } from '@redux-devtools/extension';
import { createLogger } from 'redux-logger';

import reducer, { actions, selectors, type EditorState } from './redux';

export const createStore = () => {
  const loggerMiddleware = createLogger();

  const middleware = [thunkMiddleware, loggerMiddleware];

  const store = redux.createStore<EditorState, any, any, any>(
    reducer as any,
    composeWithDevToolsLogOnlyInProduction(redux.applyMiddleware(...middleware)),
  );

  /**
   * Dev tools for redux work
   */
  if (process.env.NODE_ENV === 'development') {
    (window as any).store = store;
    (window as any).actions = actions;
    (window as any).selectors = selectors;
  }

  return store;
};

const store = createStore();

export default store;
