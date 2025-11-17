import { createSelector } from 'reselect';
// This 'module' self-import hack enables mocking during tests.
// See src/editors/decisions/0005-internal-editor-testability-decisions.md. The whole approach to how hooks are tested
// should be re-thought and cleaned up to avoid this pattern.
// eslint-disable-next-line import/no-self-import
import * as module from './selectors';

export const gameState = (state) => state.game;
const mkSimpleSelector = (cb) => createSelector([module.gameState], cb);
export const simpleSelectors = {
  settings: mkSimpleSelector(gameData => gameData.settings),
  type: mkSimpleSelector(gameData => gameData.type),
  list: mkSimpleSelector(gameData => gameData.list),
  isDirty: mkSimpleSelector(gameData => gameData.isDirty),
  completeState: mkSimpleSelector(gameData => gameData),
  // TODO fill in with selectors as needed
};

export default {
  ...simpleSelectors,
};
