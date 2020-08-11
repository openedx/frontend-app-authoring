import { createSelector } from 'reselect';
import { initLibraryUrl } from '../../common';
import { libraryDetailStoreName as storeName } from './slice';

const stateSelector = state => ({ ...state[storeName] });

const selectLibraryDetail = createSelector(
  stateSelector,
  (state) => ({
    ...state,
    library: initLibraryUrl(state.library),
  }),
);

export default selectLibraryDetail;
