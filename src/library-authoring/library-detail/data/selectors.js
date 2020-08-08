import { createSelector } from 'reselect';
import { initLibraryUrl, filterSupportedBlockTypes } from '../../common';
import { libraryDetailStoreName as storeName } from './slice';

const stateSelector = state => ({ ...state[storeName] });

const selectLibraryDetail = createSelector(
  stateSelector,
  (state) => ({
    ...state,
    library: filterSupportedBlockTypes(initLibraryUrl(state.library)),
  }),
);

export default selectLibraryDetail;
