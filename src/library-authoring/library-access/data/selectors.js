import { createSelector } from 'reselect';
import { libraryAccessStoreName as storeName } from './slice';
import { selectLibraryDetail } from '../../library-detail/data';

const stateSelector = state => ({ ...state[storeName] });

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
