import { createSelector } from 'reselect';
import { initLibraryUrl, STORE_NAMES } from '../../common';

const stateSelector = state => ({ ...state[STORE_NAMES.CREATE] });

const selectLibraryCreate = createSelector(
  stateSelector,
  (state) => ({
    ...state,
    createdLibrary: initLibraryUrl(state.createdLibrary),
  }),
);

export default selectLibraryCreate;
