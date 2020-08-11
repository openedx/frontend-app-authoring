import { createSelector } from 'reselect';
import { initLibraryUrl } from '../../common';
import { libraryListStoreName as storeName } from './slice';

const stateSelector = state => ({ ...state[storeName] });

const selectLibraryList = createSelector(
  stateSelector,
  (state) => ({
    ...state,
    libraries: state.libraries.map(initLibraryUrl),
  }),
);

export default selectLibraryList;
