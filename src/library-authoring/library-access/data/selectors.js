import { createSelector } from 'reselect';
import { selectLibraryDetail } from '../../library-detail/data';
import { STORE_NAMES } from '../../common/data';

const stateSelector = state => ({ ...state[STORE_NAMES.ACCESS] });

const selectLibraryAccess = createSelector(
  stateSelector,
  selectLibraryDetail,
  (editState, libraryState) => ({
    ...editState,
    library: libraryState.library,
    loadingStatus: libraryState.status,
  }),
);

export default selectLibraryAccess;
