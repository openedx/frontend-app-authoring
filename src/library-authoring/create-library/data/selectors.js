import { createSelector } from 'reselect';
import { initLibraryUrl } from '../../common';
import { libraryCreateFormStoreName as storeName } from './slice';

const stateSelector = state => ({ ...state[storeName] });

const selectLibraryCreateForm = createSelector(
  stateSelector,
  (state) => ({
    ...state,
    createdLibrary: initLibraryUrl(state.createdLibrary),
  }),
);

export default selectLibraryCreateForm;
