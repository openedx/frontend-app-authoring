import { combineReducers } from 'redux';

import { StrictDict } from '../../utils';

import * as app from './app';
import * as requests from './requests';
import * as video from './video';
import * as problem from './problem';
import * as game from './game';

/* eslint-disable import/no-cycle */
export { default as thunkActions } from './thunkActions';

const modules = {
  app,
  requests,
  video,
  problem,
  game,
};

const moduleProps = (propName) => Object.keys(modules).reduce(
  (obj, moduleKey) => ({ ...obj, [moduleKey]: modules[moduleKey][propName] }),
  {},
);

const rootReducer = combineReducers(moduleProps('reducer'));

const actions = StrictDict(moduleProps('actions'));

const selectors = StrictDict(moduleProps('selectors'));

export { actions, selectors };

export default rootReducer;
