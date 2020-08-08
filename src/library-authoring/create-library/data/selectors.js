import { createSelector } from 'reselect';
import { initLibraryUrl } from '../../common';
import { libraryCreateStoreName as storeName } from './slice';

const stateSelector = state => ({ ...state[storeName] });

const selectLibraryCreate = createSelector(
  stateSelector,
  (state) => ({
    ...state,
    createdLibrary: initLibraryUrl(state.createdLibrary),
  }),
);

export default selectLibraryCreate;
