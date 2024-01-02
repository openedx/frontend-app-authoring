import { createSelector } from 'reselect';
import { initLibraryUrl, STORE_NAMES } from '../../common';

const stateSelector = state => ({ ...state[STORE_NAMES.LIST] });

const selectLibraryList = createSelector(
  stateSelector,
  (state) => ({
    ...state,
    libraries: {
      ...state.libraries,
      data: state.libraries.data.map(initLibraryUrl),
    },
  }),
);

export default selectLibraryList;
