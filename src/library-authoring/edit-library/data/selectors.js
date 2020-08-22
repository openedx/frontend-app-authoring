import { createSelector } from 'reselect';

import { selectLibraryDetail } from '../../library-detail';
import { libraryEditStoreName as storeName } from './slice';

const stateSelector = state => ({ ...state[storeName] });

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
