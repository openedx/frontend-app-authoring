import { createSelector } from 'reselect';
import { filterSupportedBlockTypes, initLibraryUrl } from './utils';
import { STORE_NAMES } from './constants';

const detailStateSelector = state => ({ ...state[STORE_NAMES.DETAIL] });
const blockStateSelector = state => ({ ...state[STORE_NAMES.BLOCKS] });

// This selector is used by several features.
const selectLibraryDetail = createSelector(
  detailStateSelector,
  blockStateSelector,
  (state, blockState) => ({
    ...state,
    blocks: blockState.blocks,
    library: filterSupportedBlockTypes(initLibraryUrl(state.library)),
  }),
);
export default selectLibraryDetail;
