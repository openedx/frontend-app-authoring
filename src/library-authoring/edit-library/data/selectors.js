import { createSelector } from 'reselect';

import { selectLibraryDetail } from '../../library-detail';
import { STORE_NAMES } from '../../common/data';

const stateSelector = state => ({ ...state[STORE_NAMES.EDIT] });

const selectLibraryEdit = createSelector(
  stateSelector,
  selectLibraryDetail,
  (editState, libraryState) => ({
    ...editState,
    library: libraryState.library,
    loadingStatus: libraryState.status,
  }),
);

export default selectLibraryEdit;
