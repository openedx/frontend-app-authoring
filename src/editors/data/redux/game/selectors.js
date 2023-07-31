import { createSelector } from 'reselect';
import * as module from './selectors';

export const gameState = (state) => state.game;
const mkSimpleSelector = (cb) => createSelector([module.gameState], cb);
export const simpleSelectors = {
  exampleValue: mkSimpleSelector(gameData => gameData.exampleValue),
  settings: mkSimpleSelector(gameData => gameData.settings),
  completeState: mkSimpleSelector(gameData => gameData),
  // TODO fill in with selectors as needed
};

export default {
  ...simpleSelectors,
};
