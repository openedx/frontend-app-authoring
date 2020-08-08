import { createSelector } from 'reselect';

import { selectLibraryDetail } from '../../library-detail';
import { libraryBlockStoreName as storeName } from './slice';

const stateSelector = state => ({ ...state[storeName] });

const selectLibraryBlock = createSelector(
  stateSelector,
  selectLibraryDetail,
  (blockState, libraryState) => ({
    ...blockState,
    library: libraryState.library,
  }),
);

export default selectLibraryBlock;
