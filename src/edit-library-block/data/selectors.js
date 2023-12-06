import { createSelector } from 'reselect';

import selectLibraryDetail from '@src/library-authoring/common/data/selectors';
import { STORE_NAMES } from '@src/library-authoring/common/data';
import { libraryBlockInitialState } from './slice';

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
