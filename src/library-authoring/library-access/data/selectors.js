import { createSelector } from 'reselect';
import { STORE_NAMES } from '../../common/data';
import selectLibraryDetail from '../../common/data/selectors';

const stateSelector = state => ({ ...state[STORE_NAMES.ACCESS] });

const selectLibraryAccess = createSelector(
  stateSelector,
  selectLibraryDetail,
  (editState, libraryState) => ({
    ...editState,
    library: libraryState.library,
    loadingStatus: libraryState.loadingStatus,
  }),
);

export default selectLibraryAccess;
