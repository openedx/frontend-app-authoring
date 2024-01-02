import { createSelector } from 'reselect';

import { libraryBlockInitialState } from './slice';
import selectLibraryDetail from '../../common/data/selectors';
import { STORE_NAMES } from '../../common/data';

const stateSelector = state => ({ ...state[STORE_NAMES.BLOCKS] });

const selectLibraryBlock = createSelector(
  stateSelector,
  selectLibraryDetail,
  (blockState, libraryState) => {
    let focusedState;
    if (blockState.focusedBlock) {
      focusedState = blockState.blocks[blockState.focusedBlock];
    } else {
      focusedState = { ...libraryBlockInitialState };
    }
    return {
      ...focusedState,
      library: libraryState.library,
    };
  },
);

export default selectLibraryBlock;
